
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
import "./mgrs/_mgrs";
import "./input/_input";
import "./utils/_utils";
import "./task/_task";
import "./mvvm/_mvvm";
import "./mvvm/VMDecorator";
import "./controller/_controller";


import "./hot-update/_hot-update"
import "./red-point/_red-point"


if (!EDITOR) {
    game.emit(tnt.EVENT_TNT_INITD);
    tnt.eventMgr.emit(tnt.EVENT_TNT_INITD);
}