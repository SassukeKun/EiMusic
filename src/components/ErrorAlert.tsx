import React from 'react';

interface ErrorAlertProps {
  title: string;
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ title, message }) => {
  return (
    <div style={{ border: '1px solid red', backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '4px', margin: '10px 0' }}>
      <h4 style={{ marginTop: 0, fontWeight: 'bold' }}>{title}</h4>
      <p style={{ marginBottom: 0 }}>{message}</p>
    </div>
  );
};

export default ErrorAlert;
