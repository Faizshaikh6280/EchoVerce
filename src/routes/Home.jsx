const MyComponent = () => {
  return (
    <div className="p-10 flex flex-col items-center gap-4">
      {/* Primary Font (Luckiest Guy) with Accent Color */}
      <h1 className="font-primary text-6xl text-accent">Hello World!</h1>

      {/* Secondary Font (Poppins) with standard black */}
      <p className="font-secondary text-lg text-gray-700 max-w-md text-center">
        This is a paragraph using the Poppins font. It is great for body text
        because it is highly readable.
      </p>

      {/* Button using Accent Background */}
      <button className="bg-accent font-primary text-white text-xl px-6 py-2 rounded hover:opacity-90 transition">
        Click Me
      </button>
    </div>
  );
};

export default MyComponent;
