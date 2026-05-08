import { authService } from '../api/authService';
import { renderHeader, updateCartBadge } from '../components/header';
import { router } from '../utils/router';

export function renderLoginPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  if (authService.isAuthenticated()) {
    router.navigate('/');
    return;
  }

  app.innerHTML = `
    ${renderHeader()}
    <main class="main auth-page">
      <div class="container">
        <section class="auth-panel">
          <div class="auth-copy">
            <span class="auth-eyebrow">TechVision Account</span>
            <h1 class="auth-title">Đăng nhập hệ thống</h1>
            <p class="auth-desc">Dùng tài khoản đã đăng ký để tiếp tục mua hàng hoặc truy cập các chức năng được phân quyền.</p>
          </div>

          <form id="login-form" class="auth-form">
            <div id="login-message" class="form-message" hidden></div>

            <div class="form-group">
              <label for="username" class="form-label">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                class="form-input"
                minlength="4"
                autocomplete="username"
                required
              >
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                class="form-input"
                minlength="6"
                autocomplete="current-password"
                required
              >
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="login-submit">
              Đăng nhập
            </button>

            <p class="auth-switch">
              Chưa có tài khoản?
              <a href="/register" data-link>Đăng ký ngay</a>
            </p>
          </form>
        </section>
      </div>
    </main>
  `;

  updateCartBadge();
  setupLoginForm();
}

function setupLoginForm(): void {
  const form = document.getElementById('login-form') as HTMLFormElement | null;
  const submitButton = document.getElementById('login-submit') as HTMLButtonElement | null;
  const message = document.getElementById('login-message');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '');

    setMessage(message, '', '');
    setLoading(submitButton, true, 'Đang đăng nhập...');

    try {
      await authService.login({ username, password });
      setMessage(message, 'Đăng nhập thành công. Đang chuyển về trang chủ...', 'success');
      setTimeout(() => router.navigate('/'), 700);
    } catch (error) {
      setMessage(message, error instanceof Error ? error.message : 'Đăng nhập thất bại', 'error');
    } finally {
      setLoading(submitButton, false, 'Đăng nhập');
    }
  });
}

function setLoading(button: HTMLButtonElement | null, loading: boolean, label: string): void {
  if (!button) return;
  button.disabled = loading;
  button.textContent = label;
}

function setMessage(element: HTMLElement | null, text: string, type: 'success' | 'error' | ''): void {
  if (!element) return;
  element.hidden = !text;
  element.textContent = text;
  element.className = `form-message ${type ? `form-message-${type}` : ''}`;
}
