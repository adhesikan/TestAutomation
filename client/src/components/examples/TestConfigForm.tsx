import TestConfigForm from '../TestConfigForm';

export default function TestConfigFormExample() {
  return (
    <div className="max-w-2xl">
      <TestConfigForm
        onSave={(config) => console.log('Config saved:', config)}
        onCancel={() => console.log('Cancel clicked')}
      />
    </div>
  );
}
