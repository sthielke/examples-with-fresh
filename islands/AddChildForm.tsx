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

export default function AddChildForm() {
  const isOpen = useSignal(false);
  const childName = useSignal("");
  const selectedIcon = useSignal(DEFAULT_AVATARS[0].emoji);
  const uploadPreview = useSignal<string | null>(null);
  const uploadFile = useSignal<File | null>(null);
  const useUpload = useSignal(false);
  const error = useSignal("");
  const loading = useSignal(false);

  const resetForm = () => {
    childName.value = "";
    selectedIcon.value = DEFAULT_AVATARS[0].emoji;
    uploadPreview.value = null;
    uploadFile.value = null;
    useUpload.value = false;
    error.value = "";
    loading.value = false;
  };

  const handleClose = () => {
    isOpen.value = false;
    resetForm();
  };

  const handleFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error.value = "Please select an image file";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      error.value = "Image must be under 2MB";
      return;
    }

    uploadFile.value = file;
    useUpload.value = true;
    error.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      uploadPreview.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error.value = "";

    if (!childName.value.trim()) {
      error.value = "Please enter a name";
      return;
    }

    loading.value = true;

    try {
      let res: Response;

      if (useUpload.value && uploadFile.value) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("name", childName.value.trim());
        formData.append("avatarFile", uploadFile.value);

        res = await fetch("/api/children/add", {
          method: "POST",
          body: formData,
        });
      } else {
        // JSON for emoji icon
        res = await fetch("/api/children/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: childName.value.trim(),
            avatarIcon: selectedIcon.value,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        error.value = data.error || "Failed to add child";
        loading.value = false;
        return;
      }

      // Success - reload page to show the new child
      handleClose();
      globalThis.location.reload();
    } catch {
      error.value = "Something went wrong. Please try again.";
      loading.value = false;
    }
  };

  return (
    <div>
      {/* Add Child Button */}
      <button
        type="button"
        class="add-child-btn"
        onClick={() => (isOpen.value = true)}
      >
        <span class="add-child-btn-icon">+</span>
        <span>Add a Child</span>
      </button>

      {/* Modal Overlay */}
      {isOpen.value && (
        <div class="modal-overlay" onClick={handleClose}>
          <div
            class="modal-content"
            onClick={(e: Event) => e.stopPropagation()}
          >
            {/* Header */}
            <div class="modal-header">
              <h2 class="modal-title">Add a Child</h2>
              <button
                type="button"
                class="modal-close"
                onClick={handleClose}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error.value && (
                <div class="alert alert-error">{error.value}</div>
              )}

              {/* Name Input */}
              <div class="form-group">
                <label class="form-label" for="childName">
                  Child's Name
                </label>
                <input
                  id="childName"
                  type="text"
                  class="form-input"
                  placeholder="Enter their name"
                  value={childName.value}
                  onInput={(e) =>
                    childName.value = (e.target as HTMLInputElement).value}
                  autoFocus
                  required
                />
              </div>

              {/* Avatar Selection */}
              <div class="form-group">
                <label class="form-label">Choose an Icon</label>

                {/* Tab toggle */}
                <div class="avatar-tabs">
                  <button
                    type="button"
                    class={`avatar-tab ${!useUpload.value ? "active" : ""}`}
                    onClick={() => (useUpload.value = false)}
                  >
                    Default Icons
                  </button>
                  <button
                    type="button"
                    class={`avatar-tab ${useUpload.value ? "active" : ""}`}
                    onClick={() => (useUpload.value = true)}
                  >
                    Upload Photo
                  </button>
                </div>

                {/* Default icons grid */}
                {!useUpload.value && (
                  <div class="avatar-grid">
                    {DEFAULT_AVATARS.map((av) => (
                      <button
                        key={av.key}
                        type="button"
                        class={`avatar-option ${
                          selectedIcon.value === av.emoji ? "selected" : ""
                        }`}
                        onClick={() => (selectedIcon.value = av.emoji)}
                        title={av.label}
                      >
                        <span class="avatar-emoji">{av.emoji}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Upload area */}
                {useUpload.value && (
                  <div class="upload-area">
                    {uploadPreview.value
                      ? (
                        <div class="upload-preview-wrap">
                          <img
                            src={uploadPreview.value}
                            alt="Preview"
                            class="upload-preview-img"
                          />
                          <button
                            type="button"
                            class="upload-remove"
                            onClick={() => {
                              uploadPreview.value = null;
                              uploadFile.value = null;
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )
                      : (
                        <label class="upload-dropzone" for="avatarFile">
                          <div class="upload-dropzone-icon">📷</div>
                          <div class="upload-dropzone-text">
                            Click to upload a photo
                          </div>
                          <div class="upload-dropzone-hint">
                            PNG, JPG up to 2MB
                          </div>
                          <input
                            id="avatarFile"
                            type="file"
                            accept="image/*"
                            style="display: none;"
                            onChange={handleFileChange}
                          />
                        </label>
                      )}
                  </div>
                )}
              </div>

              {/* Preview */}
              <div class="child-preview">
                <div class="child-preview-avatar">
                  {useUpload.value && uploadPreview.value
                    ? (
                      <img
                        src={uploadPreview.value}
                        alt="Avatar"
                        style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
                      />
                    )
                    : (
                      <span style="font-size: 32px;">
                        {selectedIcon.value}
                      </span>
                    )}
                </div>
                <span class="child-preview-name">
                  {childName.value.trim() || "Child's Name"}
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                class="btn btn-primary"
                disabled={loading.value}
              >
                {loading.value ? "Adding..." : "Add Child"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
