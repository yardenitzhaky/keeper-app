import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <Button
      disabled={loading}
      {...props}
      sx={{
        position: 'relative',
        '&.Mui-disabled': {
          backgroundColor: props.color === 'primary' ? '#1976d2' : '#f5ba13',
          color: 'white',
        },
        ...props.sx,
      }}
    >
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
    </Button>
  );
};

export default LoadingButton;