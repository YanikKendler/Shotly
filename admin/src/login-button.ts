/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import AuthService from './AuthService'

@customElement('login-button')
export class LoginButton extends LitElement {
  static override styles = css`
    button{
        padding: 1rem 2rem;
        font-weight: bold;
        margin-top: 2rem;
    }
  `

  override render() {
    return html`
        <button @click=${() => AuthService.login()}>Login</button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-button': LoginButton;
  }
}
