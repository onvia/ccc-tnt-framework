
import { EDITOR } from 'cc/env';
import { game } from 'cc';

import './TNT';

import "./decorators/_decorator";
import "./mgrs/EventMgr";
import "./components/GComponent";
import './components/animation/_animation';
import './components/effect/_effect';
import './pool/_pool';

import "./scenes/scene2d/ui/_ui";
import "./scenes/scene2d/stage/_stage";
import "./scenes/scene2d/i18n/_i18n";
import "./scenes/scene2d/gui/_gui";
import "./scenes/scene2d/tiled/_tiled";
import "./scenes/SceneBase";

import "./assets-manager/AssetLoader";
import "./assets-manager/LoaderMgr";
import "./assets-manager/ResourcesMgr";
import "./scenes/SceneMgr";
import "./scenes/scene2d/ui/UIMgr";
import "./mgrs/AudioMgr";
import "./mgrs/DragDropMgr";
import "./mgrs/PoolMgr";
import "./mgrs/CaptureMgr";
import "./mgrs/LayerMgr";
import "./mgrs/PanelMgr";
import "./mgrs/RenderTextureMgr";
import "./mgrs/StorageMgr";
import "./mgrs/TimerMgr";
import "./input/KeyboardMgr";
import "./input/MouseMgr";
import "./input/TouchMgr";
import "./utils/BezierUtils";
import "./utils/Mathf";
import "./utils/StringUtils";
import "./utils/TransformUtils";
import "./utils/ComponentUtils";
import "./utils/TimeUtils";
import "./utils/TweenUtils";
import "./utils/DebugUtils";
import "./utils/FunctionUtils";
import "./task/TaskMgr";
import "./task/LoadingTaskQueue";
import "./mvvm/_mvvm";


import "./hot-update/_hot-update"
import "./red-point/_red-point"


if (!EDITOR) {
    game.emit(tnt.EVENT_TNT_INITD);
    tnt.eventMgr.emit(tnt.EVENT_TNT_INITD);
}