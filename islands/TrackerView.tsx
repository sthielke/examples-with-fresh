import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

interface ChildData {
  id: string;
  name: string;
  points: number;
  avatarIcon: string;
  avatarUrl: string;
}

interface TrackerViewProps {
  initialChildren: ChildData[];
}

export default function TrackerView(props: TrackerViewProps) {
  const children = useSignal<ChildData[]>([...props.initialChildren]);

  // Track which child is animating (by id)
  const animatingId = useSignal<string | null>(null);

  // Refs for sounds
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const failAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Play sounds
  const playSuccess = () => {
    try {
      if (!successAudioRef.current) {
        successAudioRef.current = new Audio("/success_sound.mp3");
        successAudioRef.current.volume = 0.6;
      }
      successAudioRef.current.currentTime = 0;
      successAudioRef.current.play().catch(() => {});
    } catch {
      // Audio not available
    }
  };

  const playFail = () => {
    try {
      if (!failAudioRef.current) {
        failAudioRef.current = new Audio("/fail_sound.mp3");
        failAudioRef.current.volume = 0.6;
      }
      failAudioRef.current.currentTime = 0;
      failAudioRef.current.play().catch(() => {});
    } catch {
      // Audio not available
    }
  };

  // Spawn star particles around a specific child's points element
  const spawnStars = (childId: string) => {
    const container = containerRef.current;
    if (!container) return;

    const pointsEl = container.querySelector(
      `[data-child-points="${childId}"]`,
    );
    if (!pointsEl) return;

    const rect = pointsEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - containerRect.left;
    const cy = rect.top + rect.height / 2 - containerRect.top;

    const starEmojis = ["⭐", "✨", "🌟", "💫", "⭐", "✨"];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "star-particle";
      star.textContent = starEmojis[i % starEmojis.length];

      const angle = (i / count) * 360;
      const distance = 50 + Math.random() * 60;
      const dx = Math.cos((angle * Math.PI) / 180) * distance;
      const dy = Math.sin((angle * Math.PI) / 180) * distance;

      star.style.left = `${cx}px`;
      star.style.top = `${cy}px`;
      star.style.setProperty("--dx", `${dx}px`);
      star.style.setProperty("--dy", `${dy}px`);
      star.style.animationDelay = `${Math.random() * 0.1}s`;

      container.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 900);
    }
  };

  // Poll for updates
  useEffect(() => {
    // Keep a map of previous points for comparison
    const prevPointsMap: Record<string, number> = {};
    for (const child of props.initialChildren) {
      prevPointsMap[child.id] = child.points;
    }

    const poll = async () => {
      try {
        const res = await fetch("/api/children");
        if (!res.ok) return;
        const data = await res.json();

        if (!data.children || !Array.isArray(data.children)) return;

        const newChildren: ChildData[] = data.children;

        // Check for point changes
        for (const child of newChildren) {
          const prev = prevPointsMap[child.id];
          if (prev !== undefined && child.points !== prev) {
            if (child.points > prev) {
              // Points increased
              animatingId.value = child.id;
              playSuccess();
              // Small delay so DOM updates before we query for the element
              setTimeout(() => spawnStars(child.id), 50);
              setTimeout(() => {
                animatingId.value = null;
              }, 700);
            } else {
              // Points decreased
              playFail();
            }
          }
          prevPointsMap[child.id] = child.points;
        }

        // Also add any new children to the map
        for (const child of newChildren) {
          if (prevPointsMap[child.id] === undefined) {
            prevPointsMap[child.id] = child.points;
          }
        }

        children.value = newChildren;
      } catch {
        // Silently fail
      }
    };

    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── Avatar display ──────────────────────────────────────────────────

  const renderAvatar = (child: ChildData) => {
    if (child.avatarUrl) {
      return (
        <img
          src={child.avatarUrl}
          alt={child.name}
          class="tracker-avatar-img"
        />
      );
    }
    return (
      <div class="tracker-avatar-icon">
        {child.avatarIcon || child.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────

  if (children.value.length === 0) {
    return (
      <div class="tracker-container" ref={containerRef}>
        <div class="tracker-empty">
          <div style="font-size: 48px; margin-bottom: 16px;">🧒</div>
          <p style="font-size: 18px; font-weight: 600; color: var(--color-text-light);">
            No children added yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div class="tracker-container" ref={containerRef}>
      <div class="tracker-children-grid">
        {children.value.map((child) => (
          <div key={child.id} class="tracker-child-card">
            {/* Avatar */}
            <div class="tracker-avatar-wrap">
              {renderAvatar(child)}
            </div>

            {/* Name */}
            <h2 class="tracker-child-name">{child.name}</h2>

            {/* Points */}
            <div class="tracker-points-section">
              <div class="tracker-points-label-top">Points</div>
              <div
                class={`tracker-point-value ${animatingId.value === child.id ? "tracker-point-bump" : ""}`}
                data-child-points={child.id}
              >
                {child.points}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
