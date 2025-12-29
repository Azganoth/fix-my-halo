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
          <h3>The Problem: White Halos</h3>
          <p>
            Game engines use <strong>bilinear filtering</strong> to smooth
            textures. When a pixel is on the edge of transparency, the GPU
            samples its color and blends it with its neighbors. If the
            neighboring transparent pixels are &quot;White&quot; (255, 255, 255,
            0), you get a faint white outline or{" "}
            <strong>&quot;halo&quot;</strong> around your sprite.
          </p>
          <p>
            Painting softwares frequently wipe out color data from transparent
            pixels, replacing it with a White (255, 255, 255, 0) transparent
            color.
          </p>
        </div>

        <div className="space-y-3">
          <h3>The Solution: Alpha Bleeding</h3>
          <p>
            This tool performs <strong>texture dilation</strong> by X pixels
            (padding). It spreads the color of your visible pixels into the
            adjacent transparent areas while keeping them invisible (Alpha 0).
            When the GPU samples the edge, it now finds the &quot;bled&quot;
            color instead of white, resulting in a perfect, clean transition.
          </p>
        </div>
      </div>
    </section>
  );
}
