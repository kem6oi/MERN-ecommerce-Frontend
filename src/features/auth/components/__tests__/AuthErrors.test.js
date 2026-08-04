import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUserAsync } from '../../authSlice';
import Login from '../Login';
import ResetPassword from '../ResetPassword';

describe('Auth Error Rendering Safeguards', () => {
  let testStore;

  beforeEach(() => {
    testStore = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe('Login Component', () => {
    test('renders standard string error correctly', () => {
      // Dispatch a rejected action with a string payload
      testStore.dispatch(
        loginUserAsync.rejected(null, 'request-id', {}, 'Invalid credentials')
      );

      render(
        <Provider store={testStore}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </Provider>
      );

      // Verify that the error is rendered correctly as text
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    test('renders object-based error message safely without crashing', () => {
      // Dispatch a rejected action with an object payload
      const objectError = { message: 'Failed to fetch' };
      testStore.dispatch(
        loginUserAsync.rejected(null, 'request-id', {}, objectError)
      );

      render(
        <Provider store={testStore}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </Provider>
      );

      // Verify that the error message is rendered correctly as text and does not crash
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });

    test('renders fallback string for object-based error without message', () => {
      // Dispatch a rejected action with an object payload that lacks a message property
      const objectError = { code: 500 };
      testStore.dispatch(
        loginUserAsync.rejected(null, 'request-id', {}, objectError)
      );

      render(
        <Provider store={testStore}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </Provider>
      );

      // Verify that the fallback string is rendered
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });

  describe('ResetPassword Component', () => {
    beforeEach(() => {
      // Mock search query parameters so the component renders the password fields
      window.history.pushState({}, '', '?email=test@example.com&token=123');
    });

    afterEach(() => {
      window.history.pushState({}, '', '/');
    });

    test('renders standard string error correctly', () => {
      const errorPayload = 'Invalid or expired token';
      // In ResetPassword, we dispatch resetPasswordAsync which has rejection reducer
      testStore.dispatch({
        type: 'user/resetPassword/rejected',
        payload: errorPayload,
      });

      render(
        <Provider store={testStore}>
          <MemoryRouter>
            <ResetPassword />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
    });

    test('renders object-based error message safely without crashing', () => {
      const objectError = { message: 'Network Timeout' };
      testStore.dispatch({
        type: 'user/resetPassword/rejected',
        payload: objectError,
      });

      render(
        <Provider store={testStore}>
          <MemoryRouter>
            <ResetPassword />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Network Timeout')).toBeInTheDocument();
    });

    test('renders fallback string for object-based error without message', () => {
      const objectError = { code: 400 };
      testStore.dispatch({
        type: 'user/resetPassword/rejected',
        payload: objectError,
      });

      render(
        <Provider store={testStore}>
          <MemoryRouter>
            <ResetPassword />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });
});
