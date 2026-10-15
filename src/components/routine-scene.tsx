// Original vector scenes: decorative context, not answer keys. No remote assets.
export function RoutineScene({ scene }: { scene: 'home' | 'travel' | 'ideas' }) {
  return (
    <svg
      viewBox="0 0 480 110"
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'block',
        width: '100%',
        maxHeight: 110,
        borderRadius: 16,
        background: 'var(--surface-soft, #edf5f1)',
      }}
    >
      <path d="M0 94H480" stroke="#8ba4a0" strokeWidth="2" />
      {scene === 'home' ? (
        <>
          <path d="M25 58L70 22L115 58V94H25Z" fill="#19354a" />
          <path d="M58 94V65H83V94" fill="#f2c96b" />
          <rect x="160" y="66" width="100" height="9" rx="4" fill="#16836b" />
          <path d="M172 75V94M247 75V94" stroke="#16836b" strokeWidth="7" />
          <rect x="174" y="43" width="34" height="23" rx="4" fill="#f2c96b" />
          <path d="M209 47H216V58H209" stroke="#f2c96b" strokeWidth="5" fill="none" />
          <path
            d="M319 56Q346 45 370 56V87Q345 76 319 87ZM370 56Q395 45 422 56V87Q395 76 370 87Z"
            fill="#7790c5"
            stroke="#19354a"
            strokeWidth="2"
          />
        </>
      ) : scene === 'travel' ? (
        <>
          <rect x="26" y="45" width="137" height="43" rx="10" fill="#19354a" />
          <rect x="40" y="54" width="25" height="15" rx="3" fill="#cce8e1" />
          <rect x="75" y="54" width="25" height="15" rx="3" fill="#cce8e1" />
          <rect x="110" y="54" width="34" height="15" rx="3" fill="#cce8e1" />
          <circle cx="54" cy="90" r="9" fill="#16836b" />
          <circle cx="133" cy="90" r="9" fill="#16836b" />
          <rect x="213" y="48" width="38" height="44" rx="7" fill="#f2c96b" />
          <path d="M223 47V35H241V47" stroke="#19354a" strokeWidth="4" fill="none" />
          <circle cx="348" cy="48" r="27" fill="#cce8e1" stroke="#16836b" strokeWidth="3" />
          <path d="M348 30V48L362 56" stroke="#19354a" strokeWidth="4" fill="none" />
          <path d="M420 42V93M407 55H433" stroke="#7790c5" strokeWidth="6" />
        </>
      ) : (
        <>
          <rect x="29" y="23" width="83" height="71" rx="8" fill="#19354a" />
          <path d="M45 40H92M45 51H86M45 62H95M45 73H77" stroke="#cce8e1" strokeWidth="4" />
          <path d="M182 42H204V79H182ZM215 29H237V79H215ZM248 51H270V79H248Z" fill="#16836b" />
          <path d="M173 82H284" stroke="#19354a" strokeWidth="3" />
          <path
            d="M334 25H435Q445 25 445 35V65Q445 75 435 75H376L352 91V75H334Q324 75 324 65V35Q324 25 334 25Z"
            fill="#f2c96b"
          />
          <circle cx="355" cy="50" r="4" fill="#19354a" />
          <circle cx="384" cy="50" r="4" fill="#19354a" />
          <circle cx="413" cy="50" r="4" fill="#19354a" />
        </>
      )}
    </svg>
  );
}
