let idMap = {};
let defaultId = 1;
let exportId = 1;
let nodeMap = {}
let compMap = {}
let vue = new window.Vue({
    el: "#app",
    data() {
        return {
            showPanel: false,
            nodeTreeDataTimer: null,
            nodeTreeData: [],
            nodeTreeExpandedKeys: [],
            nodeTreeCheckedKeys: [],
            defaultProps: {
                children: 'children',
                label: 'label'
            },
            filterText: "",
            currentNodeIndex: null,
            collapseNames: ['0'],
            allComp: [],
            centerDialogVisible: false,
            cacheData: [],
            cacheInfo: "",
            cacheSearch: '',
            cacheFilters: [
                { text: 'cc.Texture2D', value: 'cc.Texture2D' },
                { text: 'cc.SpriteFrame', value: 'cc.SpriteFrame' },
                { text: 'cc.Material', value: 'cc.Material' },
                { text: 'cc.EffectAsset', value: 'cc.EffectAsset' },
            ]
        }
    },
    created() {
        this.$nextTick(() => {
            this.showPanel = localStorage.getItem('showPanel') == "true" ? true : false;
            if (this.nodeTreeDataTimer == null) {
                this.nodeTreeDataTimer = setInterval(() => {
                    if (!this.showPanel) {
                        return;
                    }
                    this.getNodeTree();
                }, 200)
            }
        })
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        }
    },
    computed: {
        currentNode() {
            if (!this.currentNodeIndex) {
                return null;
            }
            let n = nodeMap[this.currentNodeIndex]
            if (!cc.isValid(n, true)) {
                this.currentNodeIndex = null;
                return null;
            }
            return n;
        },
        getCurrentNode() {
            if (this.currentNode) {

                let previewKey = window.preview_config.previewKey;
                for (let key in previewKey) {
                    let d = previewKey[key];
                    if (d.register) {
                        d.register(this.currentNode);
                    }
                }
            }
            return this.currentNode;
        },

        getCacheData() {
            let data = this.cacheData.filter(data => !this.cacheSearch || data.name.toLowerCase().includes(this.cacheSearch.toLowerCase()) || data.id.toLowerCase().includes(this.cacheSearch.toLowerCase()) || data.type.toLowerCase().includes(this.cacheSearch.toLowerCase()))
            return data;
        }
    },
    methods: {
        clickShowPanel() {
            this.showPanel = !this.showPanel;
            localStorage.setItem('showPanel', this.showPanel);
            this.updateGameView();
        },

        updateGameView() {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'))
            }, 200)
        },

        getNodeTree() {
            if (this.filterText != "") {
                return;
            }
            if (!window.cc || !cc.director) {
                return;
            }
            let scene = cc.director.getScene();
            if (!scene) {
                return;
            }
            // console.time('child')
            nodeMap = {}
            let nodes = this.getNodeInfo(scene);
            this.nodeTreeData = nodes;
            let current = this.currentNode;
            if (!cc.isValid(current, true)) {
                this.currentNodeIndex = null;
                this.updateGameView();
            }
            // console.timeEnd('child')
        },

        getNodeInfo(node) {
            let arr = [];
            for (let child of node.children) {
                let id;
                if (idMap[child._id]) {
                    id = idMap[child._id]
                } else {
                    id = defaultId++;
                    idMap[child._id] = id;
                }

                let name = child.name;
                if (typeof name != 'string') {
                    name = '-InvalidNodeName-'
                }
                let obj = {
                    label: name,
                    id: id,
                };
                nodeMap[id] = child;
                Object.defineProperty(obj, 'node', {
                    get() {
                        let n = nodeMap[id];
                        return n;
                    }
                })
                arr.push(obj)
                obj.children = this.getNodeInfo(child);
            }
            return arr;
        },

        delHtmlTag(str) {
            return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/ig, "")
        },

        clickNodeItem(node) {
            this.currentNodeIndex = node.id;
            this.allComp = [];
            let count = 0;
            this.collapseNames = [];
            compMap = {};
            let compTemplate = window.preview_config.compTemplate;
            let values = compTemplate["Node"]?.values || [];
            let o = { name: "Node", index: count + '', values: values };
            compMap[count] = node.node;
            Object.defineProperty(o, 'comp', {
                get() {
                    return compMap[this.index];
                }
            })
            this.allComp.push(o)
            this.collapseNames.push(count + '');
            count++;
            if (node?.node?._components) {
                for (let comp of node.node._components) {
                    let name = comp.name.split('<')[1].split('>')[0];
                    if (typeof name != 'string') {
                        name = '-InvalidCompName-'
                    }
                    let compTemplate = window.preview_config.compTemplate;
                    let values2 = compTemplate[name]?.values || [];
                    let o2 = { name: name, index: count + '', values: values2 };
                    compMap[count] = comp;
                    Object.defineProperty(o2, 'comp', {
                        get() {
                            return compMap[this.index];
                        }
                    })
                    this.allComp.push(o2);
                    this.collapseNames.push(count + '');
                    count++;
                }
            }
            this.updateGameView();
        },

        getNodeCompData() {
            this.nodeCompTreeData = [];
            this.nodeCompTreeData.push({ label: 'Node', children: [] })
        },

        clickNodeExpand(node, a, b) {
            if (this.nodeTreeExpandedKeys.indexOf(node.id) == -1) {
                this.nodeTreeExpandedKeys.push(node.id);
            }
        },

        clickNodeCollapse(node) {
            let index = this.nodeTreeExpandedKeys.indexOf(node.id)
            if (index != -1) {
                this.nodeTreeExpandedKeys.splice(index, 1);
                for (let child of node.children) {
                    this.clickNodeCollapse(child)
                }
            }
        },

        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },

        //comp---------------
        getCompName(str) {
            if (str.length >= 15) {
                return str.slice(0, 15) + '...'
            }
            return str;
        },

        logComp(item, e) {
            e.stopPropagation();
            console.log(item.comp);
        },

        exportComp(item, e) {
            e.stopPropagation();
            let id = exportId++;
            if (!window.preview_obj) {
                window.preview_obj = {};
            }
            window.preview_obj[id] = item.comp;
            console.log('组件已导出到window.preview_obj中: window.preview_obj[' + id + '],已粘贴至剪切板');
            navigator?.clipboard?.writeText?.('window.preview_obj[' + id + ']');
        },

        onInput(value, item, config) {
            if (config.type == 'number') {
                if (value == "" || isNaN(value)) {
                    value = 0;
                }
                item.comp[config.key] = parseFloat(value)
            } else {
                item.comp[config.key] = value;
            }
        },

        clickTexture() {
            this.centerDialogVisible = true;
            let data = window.preview_config.getCache();
            this.cacheData = data[0];
            this.cacheInfo = data[1];
        },

        getImgUrl(url) {
            if (url.indexOf('http') != -1) {
                return url;
            }
            return window.location.protocol + '//' + window.location.host + '/' + url;
        },

        wrapName(text) {
            if (text.length > 9) {
                return text.slice(0, 6) + '...'
            } else {
                return text;
            }
        }
    }
})