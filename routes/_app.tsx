import { define } from "../utils.ts";

export default define.page(function App({ Component, state }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{state.title ?? "Pointy"}</title>
        <link rel="icon" type="image/png" href="/favicon-512.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --color-primary: #6C5CE7;
            --color-primary-light: #A29BFE;
            --color-primary-dark: #4A3FB5;
            --color-accent: #FD79A8;
            --color-success: #00B894;
            --color-warning: #FDCB6E;
            --color-danger: #E17055;
            --color-bg: #F8F9FE;
            --color-card: #FFFFFF;
            --color-text: #2D3436;
            --color-text-light: #636E72;
            --color-border: #DFE6E9;
            --radius: 12px;
            --shadow: 0 2px 12px rgba(108, 92, 231, 0.08);
            --shadow-lg: 0 8px 32px rgba(108, 92, 231, 0.12);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--color-bg);
            color: var(--color-text);
            min-height: 100vh;
            line-height: 1.6;
          }

          a {
            color: var(--color-primary);
            text-decoration: none;
            transition: color 0.2s;
          }
          a:hover {
            color: var(--color-primary-dark);
          }

          .container {
            max-width: 480px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .container-wide {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 20px;
          }

          /* Auth pages layout */
          .auth-page {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 40px 20px;
            background: linear-gradient(135deg, #F8F9FE 0%, #E8E4F8 100%);
          }

          .auth-card {
            background: var(--color-card);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            padding: 40px;
            width: 100%;
            max-width: 420px;
          }

          .auth-logo {
            width: 100px;
            height: 100px;
            margin: 0 auto 16px;
            display: block;
            border-radius: 50%;
            object-fit: cover;
          }

          .auth-title {
            font-size: 28px;
            font-weight: 800;
            text-align: center;
            color: var(--color-primary);
            margin-bottom: 4px;
          }

          .auth-subtitle {
            font-size: 14px;
            text-align: center;
            color: var(--color-text-light);
            margin-bottom: 28px;
          }

          /* Form elements */
          .form-group {
            margin-bottom: 18px;
          }

          .form-label {
            display: block;
            font-size: 13px;
            font-weight: 700;
            color: var(--color-text-light);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid var(--color-border);
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
            background: #FAFBFF;
          }
          .form-input:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.15);
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
          }

          .btn-primary {
            background: var(--color-primary);
            color: white;
            width: 100%;
          }
          .btn-primary:hover {
            background: var(--color-primary-dark);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
          }
          .btn-primary:active {
            transform: translateY(0);
          }

          .btn-outline {
            background: transparent;
            color: var(--color-primary);
            border: 2px solid var(--color-primary);
          }
          .btn-outline:hover {
            background: var(--color-primary);
            color: white;
          }

          .btn-success {
            background: var(--color-success);
            color: white;
          }
          .btn-success:hover {
            background: #00A884;
          }

          .btn-danger {
            background: var(--color-danger);
            color: white;
          }

          .btn-sm {
            padding: 8px 16px;
            font-size: 14px;
          }

          .form-footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: var(--color-text-light);
          }

          .alert {
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 16px;
            font-weight: 600;
          }
          .alert-error {
            background: #FFEAEA;
            color: var(--color-danger);
            border: 1px solid #FFD0D0;
          }
          .alert-success {
            background: #E6FFF6;
            color: var(--color-success);
            border: 1px solid #B2FFE0;
          }

          /* Pointy Header */
          .pointy-header {
            background: var(--color-card);
            border-bottom: 1px solid var(--color-border);
            padding: 14px 20px;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .pointy-header-inner {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .pointy-header-brand {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .pointy-header-logo {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            object-fit: cover;
          }
          .pointy-header-title {
            font-size: 22px;
            font-weight: 800;
            color: var(--color-primary);
          }
          .pointy-header-signout {
            background: none;
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 6px 16px;
            font-size: 14px;
            font-weight: 700;
            font-family: inherit;
            color: var(--color-text-light);
            cursor: pointer;
            transition: all 0.2s;
          }
          .pointy-header-signout:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
            background: #F0EDFF;
          }

          /* Child Row (home page) */
          .child-row {
            background: var(--color-card);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 18px 24px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: box-shadow 0.2s;
          }
          .child-row:hover {
            box-shadow: var(--shadow-lg);
          }
          .child-row-editing {
            display: block;
            padding: 24px;
          }

          .child-row-left {
            display: flex;
            align-items: center;
            gap: 14px;
            flex: 1;
            min-width: 0;
          }
          .child-row-name {
            font-size: 18px;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .child-row-center {
            display: flex;
            align-items: baseline;
            gap: 4px;
            padding: 0 12px;
            flex-shrink: 0;
          }
          .child-row-points {
            font-size: 28px;
            font-weight: 800;
            color: var(--color-primary);
            line-height: 1;
            min-width: 36px;
            text-align: right;
          }
          .child-row-points-label {
            font-size: 13px;
            font-weight: 700;
            color: var(--color-text-light);
            text-transform: uppercase;
          }

          .child-row-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }

          /* Point +/- buttons */
          .point-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid var(--color-border);
            background: var(--color-card);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
            padding: 0;
            color: var(--color-text);
          }
          .point-btn:hover:not(:disabled) {
            transform: scale(1.1);
          }
          .point-btn:active:not(:disabled) {
            transform: scale(0.95);
          }
          .point-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }
          .point-btn-plus {
            border-color: var(--color-success);
            color: var(--color-success);
          }
          .point-btn-plus:hover:not(:disabled) {
            background: var(--color-success);
            color: white;
          }
          .point-btn-minus {
            border-color: var(--color-danger);
            color: var(--color-danger);
          }
          .point-btn-minus:hover:not(:disabled) {
            background: var(--color-danger);
            color: white;
          }

          /* Cash in button */
          .cashin-btn {
            padding: 6px 14px;
            border-radius: 8px;
            border: 2px solid var(--color-warning);
            background: transparent;
            color: #D68910;
            font-size: 13px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.15s;
            white-space: nowrap;
          }
          .cashin-btn:hover:not(:disabled) {
            background: var(--color-warning);
            color: white;
            border-color: var(--color-warning);
          }
          .cashin-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }

          /* Edit button */
          .edit-btn {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: none;
            background: transparent;
            color: var(--color-text-light);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
            padding: 0;
          }
          .edit-btn:hover {
            background: #F0EDFF;
            color: var(--color-primary);
          }

          /* Delete child button (in edit mode) */
          .delete-child-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: none;
            border: none;
            color: #DC3545;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            padding: 6px 10px;
            border-radius: 8px;
            transition: all 0.15s;
          }
          .delete-child-btn:hover {
            background: #FFF0F0;
            color: #B02A37;
          }

          /* Danger button */
          .btn-danger {
            background: #DC3545;
            color: white;
            border: none;
          }
          .btn-danger:hover {
            background: #B02A37;
          }
          .btn-danger:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* Confirmation modal */
          .confirm-modal {
            background: white;
            border-radius: 16px;
            padding: 32px 28px 24px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            animation: modalSlideIn 0.2s ease-out;
          }
          @keyframes modalSlideIn {
            from { opacity: 0; transform: scale(0.95) translateY(-10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          .confirm-modal-icon {
            color: #DC3545;
            margin-bottom: 12px;
          }
          .confirm-modal-title {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 8px;
            color: var(--color-text);
          }
          .confirm-modal-text {
            font-size: 14px;
            color: #666;
            line-height: 1.5;
            margin: 0 0 24px;
          }
          .confirm-modal-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
          }
          .confirm-modal-actions .btn {
            min-width: 110px;
          }

          /* Header actions (sign out + tracker link) */
          .pointy-header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .pointy-header-tracker-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--color-primary);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 14px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
          }
          .pointy-header-tracker-link:hover {
            background: #5A4FCF;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
          }

          /* ── Tracker page (read-only, all children) ─────────────── */
          .tracker-container {
            position: relative;
            padding: 48px 20px 80px;
            min-height: calc(100vh - 68px);
            background: linear-gradient(160deg, #F8F9FE 0%, #EDE8FB 50%, #E0DBFF 100%);
            overflow: hidden;
          }
          .tracker-empty {
            text-align: center;
            padding: 80px 20px;
          }

          /* Children grid */
          .tracker-children-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 28px;
            max-width: 900px;
            margin: 0 auto;
          }

          /* Individual child card */
          .tracker-child-card {
            background: white;
            border-radius: 24px;
            padding: 36px 24px 32px;
            text-align: center;
            box-shadow: 0 8px 40px rgba(108, 92, 231, 0.10);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .tracker-child-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 48px rgba(108, 92, 231, 0.16);
          }

          /* Avatar */
          .tracker-avatar-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 16px;
          }
          .tracker-avatar-img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #F0EDFF;
            box-shadow: 0 6px 20px rgba(108, 92, 231, 0.14);
          }
          .tracker-avatar-icon {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: #F8F6FF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            border: 4px solid #F0EDFF;
            box-shadow: 0 6px 20px rgba(108, 92, 231, 0.14);
            color: var(--color-primary);
            font-weight: 800;
          }

          /* Name */
          .tracker-child-name {
            font-size: 22px;
            font-weight: 800;
            color: var(--color-text);
            margin: 0 0 20px;
          }

          /* Points section */
          .tracker-points-section {
            background: linear-gradient(135deg, #F8F6FF 0%, #EDE8FB 100%);
            border-radius: 16px;
            padding: 20px 16px 24px;
          }
          .tracker-points-label-top {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--color-text-light);
            margin-bottom: 4px;
          }
          .tracker-point-value {
            font-size: 64px;
            font-weight: 900;
            line-height: 1;
            color: var(--color-primary);
            transition: transform 0.15s ease;
          }

          /* Bump animation on point change */
          .tracker-point-bump {
            animation: pointBump 0.5s ease;
          }
          @keyframes pointBump {
            0%   { transform: scale(1); }
            25%  { transform: scale(1.3); }
            50%  { transform: scale(0.92); }
            75%  { transform: scale(1.1); }
            100% { transform: scale(1); }
          }

          /* Star particles */
          .star-particle {
            position: absolute;
            font-size: 22px;
            pointer-events: none;
            z-index: 10;
            animation: starFly 0.8s ease-out forwards;
          }
          @keyframes starFly {
            0% {
              opacity: 1;
              transform: translate(0, 0) scale(0.4);
            }
            60% {
              opacity: 1;
              transform: translate(var(--dx), var(--dy)) scale(1.1);
            }
            100% {
              opacity: 0;
              transform: translate(var(--dx), var(--dy)) scale(0.6);
            }
          }

          /* Responsive tracker */
          @media (max-width: 600px) {
            .tracker-container {
              padding: 32px 12px 60px;
            }
            .tracker-children-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .tracker-avatar-img,
            .tracker-avatar-icon {
              width: 80px;
              height: 80px;
              font-size: 38px;
            }
            .tracker-child-name {
              font-size: 20px;
            }
            .tracker-point-value {
              font-size: 52px;
            }
            .tracker-child-card {
              padding: 28px 16px 24px;
            }
          }

          /* Welcome page */
          .welcome-page {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 40px 20px;
            text-align: center;
            background: linear-gradient(135deg, #F8F9FE 0%, #E8E4F8 100%);
          }

          .welcome-emoji {
            font-size: 64px;
            margin-bottom: 16px;
          }

          .welcome-title {
            font-size: 32px;
            font-weight: 800;
            color: var(--color-primary);
            margin-bottom: 12px;
          }

          .welcome-text {
            font-size: 16px;
            color: var(--color-text-light);
            max-width: 400px;
            margin-bottom: 32px;
          }

          .streak-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: linear-gradient(135deg, #FDCB6E, #E17055);
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 700;
          }

          /* Child avatar icon (emoji in circle) */
          .child-avatar-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #E8E4F8, #F0EDFF);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
            border: 2px solid var(--color-border);
          }

          /* Add Child Button */
          .add-child-btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 28px;
            background: var(--color-card);
            border: 2px dashed var(--color-primary-light);
            border-radius: var(--radius);
            color: var(--color-primary);
            font-size: 16px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            width: 100%;
            justify-content: center;
          }
          .add-child-btn:hover {
            background: #F0EDFF;
            border-color: var(--color-primary);
            transform: translateY(-1px);
            box-shadow: var(--shadow);
          }
          .add-child-btn-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: var(--color-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            line-height: 1;
          }

          /* Modal */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
            animation: fadeIn 0.15s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .modal-content {
            background: var(--color-card);
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            padding: 32px;
            width: 100%;
            max-width: 460px;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.2s ease;
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
          }
          .modal-title {
            font-size: 22px;
            font-weight: 800;
            color: var(--color-primary);
          }
          .modal-close {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: none;
            background: var(--color-bg);
            color: var(--color-text-light);
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }
          .modal-close:hover {
            background: #E8E4F8;
            color: var(--color-primary);
          }

          /* Avatar tabs */
          .avatar-tabs {
            display: flex;
            gap: 0;
            margin-bottom: 14px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid var(--color-border);
          }
          .avatar-tab {
            flex: 1;
            padding: 8px 12px;
            border: none;
            background: var(--color-bg);
            color: var(--color-text-light);
            font-size: 13px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
          }
          .avatar-tab.active {
            background: var(--color-primary);
            color: white;
          }
          .avatar-tab:hover:not(.active) {
            background: #E8E4F8;
          }

          /* Avatar grid */
          .avatar-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }
          .avatar-option {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 12px;
            border: 2px solid var(--color-border);
            background: var(--color-bg);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
            padding: 0;
          }
          .avatar-option:hover {
            border-color: var(--color-primary-light);
            background: #F0EDFF;
            transform: scale(1.05);
          }
          .avatar-option.selected {
            border-color: var(--color-primary);
            background: #E8E4F8;
            box-shadow: 0 0 0 2px var(--color-primary);
          }
          .avatar-emoji {
            font-size: 28px;
            line-height: 1;
          }

          /* Upload area */
          .upload-area {
            margin-top: 4px;
          }
          .upload-dropzone {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 28px 20px;
            border: 2px dashed var(--color-border);
            border-radius: 12px;
            background: var(--color-bg);
            cursor: pointer;
            transition: all 0.2s;
          }
          .upload-dropzone:hover {
            border-color: var(--color-primary-light);
            background: #F0EDFF;
          }
          .upload-dropzone-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }
          .upload-dropzone-text {
            font-size: 14px;
            font-weight: 700;
            color: var(--color-primary);
          }
          .upload-dropzone-hint {
            font-size: 12px;
            color: var(--color-text-light);
            margin-top: 4px;
          }
          .upload-preview-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .upload-preview-img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--color-primary-light);
          }
          .upload-remove {
            background: none;
            border: none;
            color: var(--color-danger);
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
          }
          .upload-remove:hover {
            text-decoration: underline;
          }

          /* Child preview in modal */
          .child-preview {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px;
            background: var(--color-bg);
            border-radius: 12px;
            margin-bottom: 20px;
          }
          .child-preview-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #E8E4F8, #F0EDFF);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 2px solid var(--color-border);
            overflow: hidden;
          }
          .child-preview-name {
            font-size: 18px;
            font-weight: 700;
            color: var(--color-text);
          }

          /* Responsive */
          @media (max-width: 640px) {
            .child-row {
              flex-wrap: wrap;
              gap: 12px;
              padding: 16px;
            }
            .child-row-left {
              flex: 1 1 100%;
            }
            .child-row-center {
              padding: 0;
            }
            .child-row-actions {
              flex-wrap: wrap;
              gap: 6px;
            }
            .point-btn {
              width: 34px;
              height: 34px;
            }
          }
          @media (max-width: 480px) {
            .auth-card {
              padding: 28px 20px;
            }
            .modal-content {
              padding: 24px 20px;
            }
            .avatar-grid {
              grid-template-columns: repeat(4, 1fr);
              gap: 6px;
            }
            .avatar-emoji {
              font-size: 24px;
            }
          }
        `,
          }}
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
