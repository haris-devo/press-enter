import type { ComponentType } from 'react';
import type { StepId } from '../engine/journey';
import type { SceneProps } from './kit';
import { UrlScene, CacheScene, DnsScene } from './find';
import { TcpScene, TlsScene } from './meet';
import { RequestScene, ServerScene, ResponseScene } from './ask';
import { DomScene, CssomScene, JsScene } from './build';
import { LayoutScene, PaintScene, CompositeScene } from './draw';
import { InteractiveScene } from './play';

export const SCENES: Record<StepId, ComponentType<SceneProps>> = {
  url: UrlScene,
  cache: CacheScene,
  dns: DnsScene,
  tcp: TcpScene,
  tls: TlsScene,
  request: RequestScene,
  server: ServerScene,
  response: ResponseScene,
  dom: DomScene,
  cssom: CssomScene,
  js: JsScene,
  layout: LayoutScene,
  paint: PaintScene,
  composite: CompositeScene,
  interactive: InteractiveScene,
};

export { W, H } from './kit';
export type { SceneProps } from './kit';
