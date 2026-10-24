import SeniorAccessibilityToolbar from './SeniorAccessibilityToolbar';

const SeniorPageShell = ({ children }) => (
  <div className="space-y-6 pb-4">
    <SeniorAccessibilityToolbar />
    {children}
  </div>
);

export default SeniorPageShell;
