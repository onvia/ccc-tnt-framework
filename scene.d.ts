import { MainScene } from "./assets/bundles/game/scripts/scene/MainScene"
import { WindowScene } from "./assets/bundles/window-example/scripts/WindowScene"

declare global {
	interface MainSceneOptions{}
	interface WindowSceneOptions{}

	interface GlobalSceneType{
		"MainScene": {
			ctor: MainScene,
			options: MainSceneOptions,
		}
		"WindowScene": {
			ctor: WindowScene,
			options: WindowSceneOptions,
		}
	}
}