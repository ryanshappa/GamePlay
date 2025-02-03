import React from 'react';
import Link from 'next/link';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-lg">
      <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>

      <Accordion type="single" collapsible>
        <AccordionItem value="post-not-created">
          <AccordionTrigger className="text-xl">Why is my post not being created?</AccordionTrigger>
          <AccordionContent className="text-lg">
            <p className="mb-2">
              There can be several reasons why your post is not being created:
            </p>
            <ul className="list-disc list-inside mb-2 pl-4">
              <li>
                <strong>Unity issues:</strong> Your build might have problems. Please check the&nbsp;
                <Link href="https://docs.unity3d.com/Manual/webgl-gettingstarted.html" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                  Unity WebGL documentation
                </Link>
                &nbsp;for troubleshooting tips.
              </li>
              <li>
                <strong>Godot issues:</strong> Your Godot export might not be configured correctly. See&nbsp;
                <Link href="https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                  Godot Exporting for Web
                </Link>
                &nbsp;for more details.
              </li>
              <li>
                It might also be an issue with asset paths or server configuration. Make sure to review your logs for more details.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="file-size-limit">
          <AccordionTrigger className="text-xl">How large of a file can I upload for a post?</AccordionTrigger>
          <AccordionContent className="text-lg">
            <p>
              Currently, there isn’t a strict file size limit enforced by our platform. However, we recommend
              keeping your game under <strong>1GB</strong> to ensure optimal performance and faster loading times.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="godot-game-not-looking-right">
          <AccordionTrigger className="text-xl">Why does my Godot game not look right?</AccordionTrigger>
          <AccordionContent className="text-lg">
            <p className="mb-2">
              If your Godot game doesn’t render correctly or your shaders aren’t working, note that:
            </p>
            <p className="mb-2">
              Godot 4.0 and later can only target WebGL 2.0 (using the Compatibility rendering method). 
              Forward+/Mobile rendering methods are not supported on the web platform. Additionally, Godot currently does not support WebGPU,
              which is required for Forward+/Mobile on the web.
            </p>
            <p>
              For a list of browser versions that support WebGL 2.0 and additional details, please see&nbsp;
              <Link href="https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                Godot’s Exporting for Web documentation
              </Link>.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="recommended-browsers">
          <AccordionTrigger className="text-xl">What browsers are recommended?</AccordionTrigger>
          <AccordionContent className="text-lg">
            <p>
              We recommend using a Chromium‑based browser (like Google Chrome or Microsoft Edge) or Firefox for the best experience,
              especially when running games that require WebGL 2.0 support.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
