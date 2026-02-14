import { useSignal } from "@preact/signals";

const DEFAULT_AVATARS = [
  { key: "star", emoji: "\u2B50", label: "Star" },
  { key: "flower", emoji: "\uD83C\uDF3B", label: "Flower" },
  { key: "football", emoji: "\uD83C\uDFC8", label: "Football" },
  { key: "hockey", emoji: "\uD83C\uDFD2", label: "Hockey" },
  { key: "soccer", emoji: "\u26BD", label: "Soccer" },
  { key: "basketball", emoji: "\uD83C\uDFC0", label: "Basketball" },
  { key: "unicorn", emoji: "\uD83E\uDD84", label: "Unicorn" },
  { key: "rocket", emoji: "\uD83D\uDE80", label: "Rocket" },
  { key: "rainbow", emoji: "\uD83C\uDF08", label: "Rainbow" },
  { key: "butterfly", emoji: "\uD83E\uDD8B", label: "Butterfly" },
  { key: "dinosaur", emoji: "\uD83E\uDD96", label: "Dinosaur" },
  { key: "dog", emoji: "\uD83D\uDC36", label: "Dog" },
  { key: "cat", emoji: "\uD83D\uDC31", label: "Cat" },
  { key: "bear", emoji: "\uD83D\uDC3B", label: "Bear" },
  { key: "crown", emoji: "\uD83D\uDC51", label: "Crown" },
  { key: "heart", emoji: "\u2764\uFE0F", label: "Heart" },
];

interface ChildRowProps {
  childId: string;
  initialName: string;
  initialPoints: number;
  initialAvatarIcon?: string;
  initialAvatarUrl?: string;
}

export default function ChildRow(props: ChildRowProps) {
  const points = useSignal(props.initialPoints);
  const name = useSignal(props.initialName);
  const avatarIcon = useSignal(props.initialAvatarIcon || "");
  const avatarUrl = useSignal(props.initialAvatarUrl || "");
  const loading = useSignal(false);

  // Edit mode state
  const editing = useSignal(false);
  const editName = useSignal(props.initialName);
  const editAvatarIcon = useSignal(props.initialAvatarIcon || "");
  const editAvatarUrl = useSignal(props.initialAvatarUrl || "");
  const editUploadPreview = useSignal<string | null>(null);
  const editUploadFile = useSignal<File | null>(null);
  const editUseUpload = useSignal(!!props.initialAvatarUrl);
  const editSaving = useSignal(false);
  const editError = useSignal("");

  // Delete confirmation state
  const showDeleteConfirm = useSignal(false);
  const deleting = useSignal(false);
  const removed = useSignal(false);

  // ── Point operations ──────────────────────────────────────────────────

  const adjustPoint = async (delta: number) => {
    if (loading.value) return;
    loading.value = true;
    try {
      const res = await fetch("/api/children/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: props.childId, delta }),
      });
      const data = await res.json();
      if (res.ok) {
        points.value = data.points;
      }
    } catch {
      // silently fail
    }
    loading.value = false;
  };

  const cashIn = async () => {
    if (points.value === 0) return;
    const confirmed = globalThis.confirm(
      `Cash in all ${points.value} points for ${name.value}? This will reset their points to 0.`,
    );
    if (!confirmed) return;

    loading.value = true;
    try {
      const res = await fetch("/api/children/cashin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: props.childId }),
      });
      const data = await res.json();
      if (res.ok) {
        points.value = data.points;
      }
    } catch {
      // silently fail
    }
    loading.value = false;
  };

  // ── Edit operations ───────────────────────────────────────────────────

  const startEdit = () => {
    editName.value = name.value;
    editAvatarIcon.value = avatarIcon.value;
    editAvatarUrl.value = avatarUrl.value;
    editUploadPreview.value = null;
    editUploadFile.value = null;
    editUseUpload.value = !!avatarUrl.value;
    editError.value = "";
    editing.value = true;
  };

  const cancelEdit = () => {
    editing.value = false;
    editError.value = "";
  };

  const isDirty = () => {
    if (editName.value.trim() !== name.value) return true;
    if (!editUseUpload.value && editAvatarIcon.value !== avatarIcon.value) {
      return true;
    }
    if (editUseUpload.value && editUploadFile.value) return true;
    return false;
  };

  const handleEditFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      editError.value = "Please select an image file";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      editError.value = "Image must be under 2MB";
      return;
    }
    editUploadFile.value = file;
    editUseUpload.value = true;
    editError.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      editUploadPreview.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveEdit = async () => {
    if (!editName.value.trim()) {
      editError.value = "Name is required";
      return;
    }
    editSaving.value = true;
    editError.value = "";

    try {
      let res: Response;

      if (editUseUpload.value && editUploadFile.value) {
        const formData = new FormData();
        formData.append("childId", props.childId);
        formData.append("name", editName.value.trim());
        formData.append("avatarFile", editUploadFile.value);
        res = await fetch("/api/children/update", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/children/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId: props.childId,
            name: editName.value.trim(),
            avatarIcon: editUseUpload.value ? undefined : editAvatarIcon.value,
          }),
        });
      }

      const data = await res.json();
      if (res.ok && data.child) {
        name.value = data.child.name;
        avatarIcon.value = data.child.avatarIcon || "";
        avatarUrl.value = data.child.avatarUrl || "";
        editing.value = false;
      } else {
        editError.value = data.error || "Failed to save";
      }
    } catch {
      editError.value = "Something went wrong";
    }
    editSaving.value = false;
  };

  // ── Delete operation ─────────────────────────────────────────────────

  const confirmDelete = async () => {
    deleting.value = true;
    try {
      const res = await fetch("/api/children/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: props.childId }),
      });
      if (res.ok) {
        removed.value = true;
        showDeleteConfirm.value = false;
        editing.value = false;
      } else {
        const data = await res.json();
        editError.value = data.error || "Failed to remove child";
      }
    } catch {
      editError.value = "Something went wrong";
    }
    deleting.value = false;
  };

  // ── Avatar display helper ─────────────────────────────────────────────

  const renderAvatar = (
    icon: string,
    url: string,
    fallbackName: string,
    size: number,
  ) => {
    if (url) {
      return (
        <img
          src={url}
          alt={fallbackName}
          style={`width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover;`}
        />
      );
    }
    return (
      <div
        class="child-avatar-icon"
        style={`width: ${size}px; height: ${size}px; font-size: ${Math.round(size * 0.5)}px;`}
      >
        {icon || fallbackName.charAt(0).toUpperCase()}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────

  // Child was removed -- collapse the row
  if (removed.value) {
    return null;
  }

  if (editing.value) {
    return (
      <div class="child-row child-row-editing">
        {editError.value && (
          <div class="alert alert-error" style="margin-bottom: 12px;">
            {editError.value}
          </div>
        )}

        {/* Name input */}
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" for={`edit-name-${props.childId}`}>
            Child's Name
          </label>
          <input
            id={`edit-name-${props.childId}`}
            type="text"
            class="form-input"
            value={editName.value}
            onInput={(e) =>
              editName.value = (e.target as HTMLInputElement).value}
            autoFocus
          />
        </div>

        {/* Avatar picker */}
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Icon</label>
          <div class="avatar-tabs">
            <button
              type="button"
              class={`avatar-tab ${!editUseUpload.value ? "active" : ""}`}
              onClick={() => (editUseUpload.value = false)}
            >
              Default Icons
            </button>
            <button
              type="button"
              class={`avatar-tab ${editUseUpload.value ? "active" : ""}`}
              onClick={() => (editUseUpload.value = true)}
            >
              Upload Photo
            </button>
          </div>

          {!editUseUpload.value && (
            <div class="avatar-grid">
              {DEFAULT_AVATARS.map((av) => (
                <button
                  key={av.key}
                  type="button"
                  class={`avatar-option ${
                    editAvatarIcon.value === av.emoji ? "selected" : ""
                  }`}
                  onClick={() => (editAvatarIcon.value = av.emoji)}
                  title={av.label}
                >
                  <span class="avatar-emoji">{av.emoji}</span>
                </button>
              ))}
            </div>
          )}

          {editUseUpload.value && (
            <div class="upload-area">
              {editUploadPreview.value
                ? (
                  <div class="upload-preview-wrap">
                    <img
                      src={editUploadPreview.value}
                      alt="Preview"
                      class="upload-preview-img"
                    />
                    <button
                      type="button"
                      class="upload-remove"
                      onClick={() => {
                        editUploadPreview.value = null;
                        editUploadFile.value = null;
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )
                : (
                  <label
                    class="upload-dropzone"
                    for={`edit-avatar-${props.childId}`}
                    style="padding: 16px;"
                  >
                    <div class="upload-dropzone-icon" style="font-size: 24px;">
                      📷
                    </div>
                    <div class="upload-dropzone-text" style="font-size: 13px;">
                      Click to upload
                    </div>
                    <input
                      id={`edit-avatar-${props.childId}`}
                      type="file"
                      accept="image/*"
                      style="display: none;"
                      onChange={handleEditFileChange}
                    />
                  </label>
                )}
            </div>
          )}
        </div>

        {/* Edit actions */}
        <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center;">
          <button
            type="button"
            class="delete-child-btn"
            onClick={() => (showDeleteConfirm.value = true)}
            title="Remove child"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Remove Child
          </button>
          <div style="display: flex; gap: 8px;">
            <button
              type="button"
              class="btn btn-sm btn-outline"
              onClick={cancelEdit}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              disabled={!isDirty() || editSaving.value}
              onClick={saveEdit}
              style={!isDirty() ? "opacity: 0.5; cursor: not-allowed;" : ""}
            >
              {editSaving.value ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm.value && (
          <div
            class="modal-overlay"
            onClick={() => (showDeleteConfirm.value = false)}
          >
            <div
              class="confirm-modal"
              onClick={(e: Event) => e.stopPropagation()}
            >
              <div class="confirm-modal-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 class="confirm-modal-title">Remove {name.value}?</h3>
              <p class="confirm-modal-text">
                Are you sure you want to remove <strong>{name.value}</strong>?
                This will permanently delete all of their points and data.
                This action cannot be undone.
              </p>
              <div class="confirm-modal-actions">
                <button
                  type="button"
                  class="btn btn-sm btn-outline"
                  onClick={() => (showDeleteConfirm.value = false)}
                  disabled={deleting.value}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-danger"
                  onClick={confirmDelete}
                  disabled={deleting.value}
                >
                  {deleting.value ? "Removing..." : "Yes, Remove"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Normal (non-editing) row ──────────────────────────────────────────

  return (
    <div class="child-row">
      <div class="child-row-left">
        {renderAvatar(avatarIcon.value, avatarUrl.value, name.value, 52)}
        <div class="child-row-name">{name.value}</div>
      </div>

      <div class="child-row-center">
        <span class="child-row-points">{points.value}</span>
        <span class="child-row-points-label">pts</span>
      </div>

      <div class="child-row-actions">
        <button
          type="button"
          class="point-btn point-btn-minus"
          onClick={() => adjustPoint(-1)}
          disabled={loading.value || points.value === 0}
          title="Remove 1 point"
          aria-label="Remove 1 point"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button
          type="button"
          class="point-btn point-btn-plus"
          onClick={() => adjustPoint(1)}
          disabled={loading.value}
          title="Add 1 point"
          aria-label="Add 1 point"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button
          type="button"
          class="cashin-btn"
          onClick={cashIn}
          disabled={loading.value || points.value === 0}
          title="Cash in points"
        >
          Cash in
        </button>

        <button
          type="button"
          class="edit-btn"
          onClick={startEdit}
          title="Edit child"
          aria-label="Edit child"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
