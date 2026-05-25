const Loader = ({ size = 'md', text = '' }) => {
  const sizeClass = size === 'lg' ? 'loader-lg' : '';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '24px',
    }}>
      <div className={`loader ${sizeClass}`} />
      {text && (
        <span style={{
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;
