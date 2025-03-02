import Image from "next/image"
import ContentContainer from "./components/content-container"

export default function Home() {
  return (
    <ContentContainer>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-violet-400 sm:text-4xl">Welcome to Our Platform</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-violet-300">About Us</h2>
            <p className="text-gray-300 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed
              erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum
              feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.
            </p>
          </div>

          <div className="relative h-64 rounded-lg overflow-hidden">
            <Image src="/placeholder.svg?height=400&width=600" alt="Placeholder image" fill className="object-cover" />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mt-8">
          <h2 className="text-xl font-semibold text-violet-300 mb-4">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed
            erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim.
            Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut
            dapibus. Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio.
          </p>
        </div>
      </div>
    </ContentContainer>
  )
}

