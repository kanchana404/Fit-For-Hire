import React from 'react'

const HeroBackground = () => {
  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
      
      {/* Animated Blur Circles */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />
      
      {/* Content Container */}
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Your {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                Awesome Title
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
              Add your descriptive text here that explains your content or purpose.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroBackground