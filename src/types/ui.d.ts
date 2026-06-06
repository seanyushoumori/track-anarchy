/** Subway Builder Modding API v1.0.0 */

// =============================================================================
// UI PLACEMENT & NOTIFICATION TYPES
// =============================================================================

/** Available UI placement locations for mod components */
export type UIPlacement =
  | 'settings-menu'
  | 'escape-menu'
  | 'bottom-bar'
  | 'top-bar'
  | 'debug-panel'
  | 'escape-menu-buttons'
  | 'main-menu'
  | 'menu-items'
  | 'pause-menu'
  | 'debug';

/** Notification severity levels */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/** UI theme options */
export type Theme = 'light' | 'dark' | 'system';

/** Button style variants for styled buttons */
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

// =============================================================================
// UI PRIMITIVE OPTIONS
// =============================================================================

export interface UIButtonOptions {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
}

export interface UIToggleOptions {
  id: string;
  label: string;
  defaultValue?: boolean;
  onChange: (enabled: boolean) => void;
}

export interface UISliderOptions {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  onChange: (value: number) => void;
}

export interface UISelectOption {
  value: string;
  label: string;
}

export interface UISelectOptions {
  id: string;
  label: string;
  options: UISelectOption[];
  defaultValue: string;
  onChange: (value: string) => void;
}

export interface UITextOptions {
  id: string;
  text: string;
  className?: string;
}

export interface UISeparatorOptions {
  id: string;
}

export interface UIComponentOptions {
  id: string;
  component: React.ComponentType;
}

// =============================================================================
// TOOLBAR OPTIONS
// =============================================================================

export interface UIToolbarButtonOptions {
  id: string;
  icon: string;
  tooltip: string;
  onClick: () => void;
  isActive?: () => boolean;
}

export interface UIToolbarPanelOptions {
  id: string;
  icon: string;
  tooltip: string;
  title: string;
  width: number;
  render: () => unknown;
}

// =============================================================================
// FLOATING PANEL OPTIONS
// =============================================================================

export interface UIFloatingPanelOptions {
  id: string;
  title?: string;
  icon?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultPosition?: { x: number; y: number };
  render: () => unknown;
}

// =============================================================================
// STYLED COMPONENT OPTIONS
// =============================================================================

export interface UIStyledButtonOptions {
  id: string;
  label: string;
  icon?: string;
  variant?: ButtonVariant;
  onClick: () => void;
}

export interface UIStyledToggleOptions {
  id: string;
  label: string;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
}

export interface UIStyledSliderOptions {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  showValue?: boolean;
  unit?: string;
  onChange: (value: number) => void;
}

// =============================================================================
// MAIN MENU OPTIONS
// =============================================================================

export interface UIMainMenuButtonOptions {
  id: string;
  text: string;
  onClick: () => void;
  description?: string;
  arrowBearing?: number;
}
