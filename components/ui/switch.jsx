// SwitchComponent.jsx

import * as SwitchPrimitive from "@radix-ui/react-switch";
import "./Switch.css"; // Normal CSS

const Switch = () => {
  return (
    <form>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <label htmlFor="airplane-mode">Airplane Mode</label>
        <SwitchPrimitive.Root className="switch-root" id="airplane-mode">
          <SwitchPrimitive.Thumb className="switch-thumb" />
        </SwitchPrimitive.Root>
      </div>
    </form>
  );
};

export default Switch;
