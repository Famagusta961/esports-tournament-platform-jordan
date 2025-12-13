// TEMPORARY DUMMY COMPONENT TO TEST STACK OVERFLOW ISOLATION
const Wallet = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-2xl font-bold text-green-600">
        Wallet OK - No Crash
      </div>
    </div>
  );
};

export default Wallet;