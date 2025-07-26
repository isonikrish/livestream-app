import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Eye, Video } from 'lucide-react'

function Home() {
    return (
        <div className="relative h-screen w-full bg-gradient-to-br from-[#050509] via-[#0d0f1a] to-[#0a0a0a] overflow-hidden">

            {/* Optional animated gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_40%)] opacity-30 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
                <div className="max-w-4xl text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
                        LiveStream
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Go live instantly. Host streams and let anyone watch your conversation - all in real-time.
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
                        {/* <Link to="/watch">
                            <Button
                                size="lg"
                                variant="outline"

                            >
                                <Eye className="w-5 h-5 mr-2" />
                                Watch Stream
                            </Button>
                        </Link> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
