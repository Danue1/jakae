"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  characterCoverImage,
  characterDisplayName,
  type Character,
  type Worldview,
} from "../core/model";
import { useLocale, useTranslations } from "next-intl";
import { PRESET_BACKGROUND_COLORS } from "./Avatar";
import { characterHref } from "../react/links";
import { useImageUrl } from "../react/useImageUrl";

interface Neighbor {
  character: Character;
  outbound: string | null;
  inbound: string | null;
}

// 이 캐릭터와 직접 연결된 이웃 — 나가는 관계(A→B)와 들어오는 역관계(B→A)를 한 이웃으로 합친다.
function collectNeighbors(
  character: Character,
  characters: Character[],
): Neighbor[] {
  const activeById = new Map(
    characters
      .filter((existing) => existing.deletedAt === null)
      .map((existing) => [existing.id, existing]),
  );
  const order: string[] = [];
  const outbound = new Map<string, string>();
  const inbound = new Map<string, string>();

  for (const relation of character.relations) {
    if (!activeById.has(relation.targetCharacterId)) continue;
    if (!order.includes(relation.targetCharacterId))
      order.push(relation.targetCharacterId);
    outbound.set(relation.targetCharacterId, relation.label);
  }
  for (const other of activeById.values()) {
    if (other.id === character.id) continue;
    const back = other.relations.find(
      (relation) => relation.targetCharacterId === character.id,
    );
    if (!back) continue;
    if (!order.includes(other.id)) order.push(other.id);
    inbound.set(other.id, back.label);
  }

  return order
    .map((id) => activeById.get(id))
    .filter((existing): existing is Character => existing !== undefined)
    .map((neighborCharacter) => ({
      character: neighborCharacter,
      outbound: outbound.get(neighborCharacter.id) ?? null,
      inbound: inbound.get(neighborCharacter.id) ?? null,
    }));
}

function edgeText(neighbor: Neighbor): string {
  const parts = [neighbor.outbound, neighbor.inbound]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  if (parts.length === 0) return "";
  return [...new Set(parts)].join(" ↔ ");
}

function nodeColor(character: Character): string {
  if (character.appearance.backgroundColor)
    return character.appearance.backgroundColor;
  let sum = 0;
  for (const letter of character.id) sum += letter.charCodeAt(0);
  return (
    PRESET_BACKGROUND_COLORS[sum % PRESET_BACKGROUND_COLORS.length] ?? "#cfe0f6"
  );
}

function truncate(name: string): string {
  return name.length > 7 ? `${name.slice(0, 7)}…` : name;
}

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 300;
const CENTER_X = VIEW_WIDTH / 2;
const CENTER_Y = VIEW_HEIGHT / 2;
const HUB_RADIUS = 26;
const NODE_RADIUS = 20;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function neighborPosition(index: number, count: number): { x: number; y: number } {
  const radiusX = 235;
  const radiusY = 100;
  // 이웃이 하나면 중심 바로 위로 붙지 않도록 우상단에 놓는다.
  const angle =
    count === 1 ? -0.5 : -Math.PI / 2 + (index * (2 * Math.PI)) / count;
  return {
    x: CENTER_X + radiusX * Math.cos(angle),
    y: CENTER_Y + radiusY * Math.sin(angle),
  };
}

// 노드 경계까지 줄인 시작·끝점 — 화살표가 원 바깥에 놓이게 한다.
function trimToBorders(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  radiusA: number,
  radiusB: number,
) {
  const deltaX = bx - ax;
  const deltaY = by - ay;
  const length = Math.hypot(deltaX, deltaY) || 1;
  const unitX = deltaX / length;
  const unitY = deltaY / length;
  return {
    x1: ax + unitX * radiusA,
    y1: ay + unitY * radiusA,
    x2: bx - unitX * radiusB,
    y2: by - unitY * radiusB,
  };
}

function GraphNode({
  character,
  x,
  y,
  radius,
  isHub,
  onNavigate,
}: {
  character: Character;
  x: number;
  y: number;
  radius: number;
  isHub: boolean;
  onNavigate?: () => void;
}) {
  const locale = useLocale();
  const imageUrl = useImageUrl(characterCoverImage(character)?.blobId ?? null);
  const clipId = `graph-clip-${character.id}`;
  const name = truncate(characterDisplayName(character, locale) || "-");
  return (
    <g
      onClick={onNavigate}
      style={{ cursor: onNavigate ? "pointer" : "default" }}
    >
      {isHub && (
        <circle
          cx={x}
          cy={y}
          r={radius + 3}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2.5}
        />
      )}
      <clipPath id={clipId}>
        <circle cx={x} cy={y} r={radius} />
      </clipPath>
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={nodeColor(character)}
        stroke="var(--color-ground)"
        strokeWidth={2}
      />
      {imageUrl ? (
        <image
          href={imageUrl}
          x={x - radius}
          y={y - radius}
          width={radius * 2}
          height={radius * 2}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <g clipPath={`url(#${clipId})`} fill="var(--color-ground)" opacity={0.9}>
          <circle cx={x} cy={y - radius * 0.15} r={radius * 0.32} />
          <circle cx={x} cy={y + radius * 0.62} r={radius * 0.52} />
        </g>
      )}
      <text
        x={x}
        y={y + radius + 15}
        textAnchor="middle"
        fontSize={13}
        fontWeight={isHub ? 800 : 600}
        fill="var(--color-ink)"
      >
        {name}
      </text>
    </g>
  );
}

export function RelationGraph({
  worldview,
  character,
  characters,
}: {
  worldview: Worldview;
  character: Character;
  characters: Character[];
}) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const transformRef = useRef(transform);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const lastPointRef = useRef({ x: 0, y: 0 });

  const apply = (next: { x: number; y: number; scale: number }) => {
    transformRef.current = next;
    setTransform(next);
  };

  const toViewBox = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const mapped = point.matrixTransform(ctm.inverse());
    return { x: mapped.x, y: mapped.y };
  };

  const zoomAround = (viewX: number, viewY: number, factor: number) => {
    const { x, y, scale } = transformRef.current;
    const nextScale = clampScale(scale * factor);
    apply({
      x: viewX - ((viewX - x) / scale) * nextScale,
      y: viewY - ((viewY - y) / scale) * nextScale,
      scale: nextScale,
    });
  };

  // 휠 확대는 preventDefault가 필요해 non-passive 네이티브 리스너로 붙인다.
  // ref·setter만 참조하므로 마운트 시 한 번만 등록한다.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const view = point.matrixTransform(ctm.inverse());
      const { x, y, scale } = transformRef.current;
      const nextScale = clampScale(scale * Math.exp(-event.deltaY * 0.0015));
      transformRef.current = {
        x: view.x - ((view.x - x) / scale) * nextScale,
        y: view.y - ((view.y - y) / scale) * nextScale,
        scale: nextScale,
      };
      setTransform(transformRef.current);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const neighbors = collectNeighbors(character, characters);
  if (neighbors.length === 0) return null;

  const positions = neighbors.map((_, index) =>
    neighborPosition(index, neighbors.length),
  );

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    draggingRef.current = true;
    movedRef.current = false;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    lastPointRef.current = toViewBox(event.clientX, event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    if (
      Math.hypot(
        event.clientX - pointerStartRef.current.x,
        event.clientY - pointerStartRef.current.y,
      ) > 4
    ) {
      movedRef.current = true;
    }
    const point = toViewBox(event.clientX, event.clientY);
    const { x, y, scale } = transformRef.current;
    apply({
      x: x + (point.x - lastPointRef.current.x),
      y: y + (point.y - lastPointRef.current.y),
      scale,
    });
    lastPointRef.current = point;
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const navigateTo = (targetId: string) => {
    // 드래그로 끝난 포인터업은 노드 이동으로 취급하지 않는다.
    if (movedRef.current) return;
    router.push(characterHref(locale, worldview.id, targetId));
  };

  const controlButton = "rounded-lg bg-ground p-1.5 text-muted shadow-popover hover:text-ink";

  return (
    <div className="relative mb-3 h-52 overflow-hidden rounded-card bg-hover">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <marker
            id="graph-arrow-end"
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={6}
            markerHeight={6}
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--color-accent)" fillOpacity={0.55} />
          </marker>
          <marker
            id="graph-arrow-start"
            viewBox="0 0 10 10"
            refX={1}
            refY={5}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--color-accent)" fillOpacity={0.55} />
          </marker>
        </defs>

        <g
          transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}
        >
          {neighbors.map((neighbor, index) => {
            const position = positions[index];
            if (!position) return null;
            const trimmed = trimToBorders(
              CENTER_X,
              CENTER_Y,
              position.x,
              position.y,
              HUB_RADIUS + 4,
              NODE_RADIUS + 8,
            );
            const midX = (trimmed.x1 + trimmed.x2) / 2;
            const midY = (trimmed.y1 + trimmed.y2) / 2;
            const deltaX = trimmed.x2 - trimmed.x1;
            const deltaY = trimmed.y2 - trimmed.y1;
            const length = Math.hypot(deltaX, deltaY) || 1;
            const bow = 16;
            const controlX = midX + (-deltaY / length) * bow;
            const controlY = midY + (deltaX / length) * bow;
            return (
              <path
                key={neighbor.character.id}
                d={`M ${trimmed.x1} ${trimmed.y1} Q ${controlX} ${controlY} ${trimmed.x2} ${trimmed.y2}`}
                fill="none"
                stroke="var(--color-accent)"
                strokeOpacity={0.38}
                strokeWidth={2}
                markerEnd={
                  neighbor.outbound !== null ? "url(#graph-arrow-end)" : undefined
                }
                markerStart={
                  neighbor.inbound !== null ? "url(#graph-arrow-start)" : undefined
                }
              />
            );
          })}

          {neighbors.map((neighbor, index) => {
            const position = positions[index];
            if (!position) return null;
            const text = edgeText(neighbor);
            if (!text) return null;
            const trimmed = trimToBorders(
              CENTER_X,
              CENTER_Y,
              position.x,
              position.y,
              HUB_RADIUS + 4,
              NODE_RADIUS + 8,
            );
            const midX = (trimmed.x1 + trimmed.x2) / 2;
            const midY = (trimmed.y1 + trimmed.y2) / 2;
            const deltaX = trimmed.x2 - trimmed.x1;
            const deltaY = trimmed.y2 - trimmed.y1;
            const length = Math.hypot(deltaX, deltaY) || 1;
            const bow = 16;
            const labelX = midX + (-deltaY / length) * bow;
            const labelY = midY + (deltaX / length) * bow;
            const width = text.length * 8 + 16;
            return (
              <g key={`label-${neighbor.character.id}`}>
                <rect
                  x={labelX - width / 2}
                  y={labelY - 11}
                  width={width}
                  height={22}
                  rx={11}
                  fill="var(--color-ground)"
                  stroke="var(--color-line)"
                />
                <text
                  x={labelX}
                  y={labelY + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="var(--color-muted)"
                >
                  {text}
                </text>
              </g>
            );
          })}

          <GraphNode
            character={character}
            x={CENTER_X}
            y={CENTER_Y}
            radius={HUB_RADIUS}
            isHub
          />
          {neighbors.map((neighbor, index) => {
            const position = positions[index];
            if (!position) return null;
            return (
              <GraphNode
                key={neighbor.character.id}
                character={neighbor.character}
                x={position.x}
                y={position.y}
                radius={NODE_RADIUS}
                isHub={false}
                onNavigate={() => navigateTo(neighbor.character.id)}
              />
            );
          })}
        </g>
      </svg>

      <div className="absolute right-2 top-2 flex flex-col gap-1">
        <button
          type="button"
          aria-label={t("graph.zoomIn")}
          className={controlButton}
          onClick={() => zoomAround(CENTER_X, CENTER_Y, 1.25)}
        >
          <Plus size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={t("graph.zoomOut")}
          className={controlButton}
          onClick={() => zoomAround(CENTER_X, CENTER_Y, 0.8)}
        >
          <Minus size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={t("graph.reset")}
          className={controlButton}
          onClick={() => apply({ x: 0, y: 0, scale: 1 })}
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
