import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import authService from './AuthService'

@customElement('auth-callback')
export class AuthCallback extends LitElement {
    override connectedCallback() {
        super.connectedCallback()

        authService
            .handleAuthentication()
            .then((targetUrl) => {
                window.location.href = targetUrl + "/"
            })
            .catch((error) => {
                authService.logout(true)
            })
    }

    override render() {
        return html`<p>working..</p>`
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'auth-callback': AuthCallback;
  }
}
