import { InfoIcon } from "lucide-react";

export function ProcessExplanation() {
  return (
    <section
      id="how-it-works"
      className="w-full max-w-3xl scroll-mt-20 space-y-8"
    >
      <div className="flex items-center justify-center gap-2 md:justify-start">
        <InfoIcon className="size-6 text-primary" />
        <h2 className="text-2xl font-bold">How it works</h2>
      </div>

      <img
        className="mx-auto"
        src="showcase.png"
        alt="The problem and the solution showcased here."
      />
      <div className="grid gap-6 md:grid-cols-2 [&_h3]:font-semibold [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground">
        <div className="space-y-3">
          <h3>The Problem</h3>
          <p>
            In game engines some texture filtering tecniques cause the textures
            to create a white/black halo around themselves. This happens because
            the GPU samples the pixels at the edge with their transparent
            neighbors to create a smooth transition, when the neighbor pixels
            are saved as <strong>transparent white</strong> (255, 255, 255, 0)
            or <strong>transparent black</strong> (0, 0, 0, 0) it creates a
            strong contrast and results in rendering a faint outline around your
            sprite.
          </p>
        </div>

        <div className="space-y-3">
          <h3>The Solution</h3>
          <p>
            This tool performs <strong>texture dilation</strong> by X pixels
            (padding). It spreads the color of the edge pixels into the adjacent
            transparent areas while preserving their transparency. When the GPU
            samples the edge, it now finds the &quot;bled&quot; color instead of
            white, resulting in a perfect, clean transition.
          </p>
        </div>
      </div>
    </section>
  );
}
