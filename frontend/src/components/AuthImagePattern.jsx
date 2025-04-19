const AuthImagePattern = ({ title, subtitle }) => {
    return (
        <div className="hidden lg:flex items-center justify-center bg-base-200 min-h-screen p-12">
            <div className="max-w-md text-center">
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[...Array(9)].map((_, i) => (
                        <div
                            key={i}
                            className={`
                                aspect-square 
                                rounded-2xl 
                                ${i % 3 === 0 ? "bg-primary/60 border-2 border-primary/80" :
                                    i % 3 === 1 ? "bg-secondary/60 border-2 border-secondary/80" :
                                        "bg-accent/60 border-2 border-accent/80"}
                                shadow-[0_4px_12px_rgba(0,0,0,0.15)]
                                ${i % 2 === 0 ? "animate-pulse" : ""}
                                hover:shadow-[0_0_20px_rgba(59,130,246,0.7)]
                                transition-all duration-300
                            `}
                        />
                    ))}
                </div>
                <h2 className="text-2xl font-bold mb-4 text-primary">{title}</h2>
                <p className="text-base-content/60">{subtitle}</p>
            </div>
        </div>
    );
};

export default AuthImagePattern;