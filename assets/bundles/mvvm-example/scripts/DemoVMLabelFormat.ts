import { _decorator, Component, Node, Vec3, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DemoVMLabelFormat')
export class DemoVMLabelFormat extends tnt.SceneBase {

    data = {

        hp: 100,
        limitList: ["abcdefg", "efghteav", 'pvmiasv', 'vmoaisdn', 'viuoahsn'],
        limit: "abcdefg",
        limitShow: "abcdefg",
        num: {
            int: 1,
            fix: 1,
            per: 0,
            pad: 1,
            sep: 500,
            mmss: 1,
            hhmmss: 1,
        },
        show: {
            int: 1,
            fix: 1,
            per: 0,
            pad: 1,
            sep: 500,
            mmss: 1,
            hhmmss: 1,
        },
        step: {
            int: 3,
            fix: 1,
            per: 0.005,
            pad: 1,
            sep: 76,
            mmss: 60,
            hhmmss: 88,
        },

        name: "老白",
        level: 9,
        count: 10,
        time: 0,

    }

    onEnterTransitionStart(sceneName?: string): void {

        tnt.vm.observe(this);

        let labelLimit = this.getLabelByName("labelLimit");
        tnt.vm.label(this, labelLimit, [`*.limitShow`, `*.limit`]);

        Object.keys(this.data.num).forEach((key) => {
            let propertyKey = `label${key.slice(0, 1).toUpperCase() + key.slice(1)}`
            let label = this.getLabelByName(propertyKey);
            tnt.vm.label(this, label, {
                'string': {
                    watchPath: [`*.num.${key}`, `*.show.${key}`],
                    tween: true
                }
            });
        });

        this.schedule(() => {
            Object.keys(this.data.num).forEach((key) => {
                this.data.num[key] += this.data.step[key];
                this.data.show[key] += this.data.step[key];
            });

            let element = this.data.limitList[Math.floor(Math.random() * this.data.limitList.length)];
            this.data.limit = this.data.limitShow = element;


            this.data.time++;
            this.data.count += 5;
            this.data.level += 2;
        }, 1);
    }

    protected onDestroy(): void {
        tnt.vm.violate(this);
    }
}