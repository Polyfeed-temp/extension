import React, { useState } from 'react';
import { login } from '../../services/user.service';
import { toast } from 'react-toastify';
import { useUserDispatch } from '../../store/UserContext';
import ForgotPasswordPopup from '../Sidebar/ForgotPasswordPopUp';

const LogoWithName = require('../../assets/logo/PolyFeed_BlackText.png')
  .default as string;

interface LoginViewProps {
  onLogin: () => void;
  onSignUp?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const dispatch = useUserDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const status = login(username, password);
    const val = toast.promise(status, {
      pending: 'Logging in...',
      success: 'Logged in successfully',
      error: 'Login failed',
    });

    try {
      const user = await status;
      if (user) {
        dispatch({ type: 'INITIALIZE', payload: user });
        onLogin();
      }
    } catch (err) {
      setErrorMessage('Username or password is incorrect');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <img
        src={LogoWithName}
        style={{ height: 'auto', width: '50%' }}
        alt="Logo"
      />
      <p style={{ marginTop: '16px', fontSize: '24px', fontWeight: 'bold' }}>
        Welcome to PolyFeed
      </p>
      <p style={{ marginTop: '16px', color: '#9CA3AF' }}>
        PolyFeed is a feedback management system that allows you to analyze and
        improve your feedback and observe how students interact with your
        feedback.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ width: '100%', marginTop: '16px' }}
      >
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Email"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            color: 'black',
            backgroundColor: 'white',
          }}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            color: 'black',
            backgroundColor: 'white',
          }}
          required
        />
        {errorMessage && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            {errorMessage}
          </div>
        )}
        <button
          type="submit"
          style={{
            backgroundColor: 'black',
            color: 'white',
            width: '100%',
            borderRadius: '8px',
            padding: '10px 16px',
            marginTop: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          LOGIN
        </button>
      </form>
      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          style={{
            color: '#1D4ED8',
            background: 'none',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Forgot Password?
        </button>
      </div>
      {onSignUp && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{ color: '#9CA3AF' }}>Don't have an account? </span>
          <button
            onClick={onSignUp}
            style={{
              color: '#1D4ED8',
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Sign up
          </button>
        </div>
      )}
      <ForgotPasswordPopup
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onGoToSignUp={onSignUp}
      />
    </div>
  );
};
