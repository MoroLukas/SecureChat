const AuthImagePattern = ({ title, subtitle }) => {
    return (
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-12">
            <div className="max-w-md text-center text-purple-100">
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className={`aspect-square rounded-xl bg-purple-600/40 backdrop-blur-sm ${
                                i % 3 === 0 ? "animate-pulse delay-100" : i % 3 === 1 ? "animate-pulse delay-300" : "animate-pulse delay-500"
                            }`}
                        />
                    ))}
                </div>
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                <p className="text-purple-200 text-lg">{subtitle}</p>
            </div>
        </div>
    );
};

export default AuthImagePattern;