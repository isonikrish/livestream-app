import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Eye, Video } from 'lucide-react'

function Home() {
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-[#0a0a0f] via-[#0d0f1a] to-[#050509] overflow-hidden">

      {/* Animated radial background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.07),transparent_45%)] pointer-events-none animate-pulse" />

      {/* Glow behind the title */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-800 opacity-20 blur-3xl rounded-full z-0" />

      <div className="absolute inset-0 flex items-center justify-center z-10 px-6">
        <div className="max-w-3xl text-center animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl">
            Meetly
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
            Go live instantly. Host or join meetings — experience real-time video calling with ease.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/stream">
              <Button
                size="lg"
              
              >
                <Video className="w-5 h-5 mr-2" />
                Start Streaming
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
