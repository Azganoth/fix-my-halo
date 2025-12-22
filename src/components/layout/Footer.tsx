export function Footer() {
  return (
    <footer className="border-t p-8">
      <div className="container mx-auto">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          <a
            className="font-medium underline underline-offset-4"
            href="https://github.com/Azganoth"
            target="_blank"
            rel="noreferrer"
          >
            Azganoth
          </a>
          . Source code is available on{" "}
          <a
            href="https://github.com/Azganoth/fix-my-halo"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
