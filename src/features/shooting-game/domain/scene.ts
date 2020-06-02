/**
 * シーンを管理するためのクラス
 */
export class SceneManager {
  scene: { [k: string]: () => {} };
  activeScene: (activeTime: number) => {};
  startTime: number;
  frame: number;
  /**
   * @constructor
   */
  constructor() {
    /**
     * シーンを格納するためのオブジェクト
     * @type {object}
     */
    this.scene = {};
    /**
     * 現在アクティブなシーン
     * @type {function}
     */
    this.activeScene = null as any;
    /**
     * 現在のシーンがアクティブになった時刻のタイムスタンプ
     * @type {number}
     */
    this.startTime = null as any;
    /**
     * 現在のシーンがアクティブになってからのシーンの実行回数（カウンタ）
     * @type {number}
     */
    this.frame = null as any;
  }

  /**
   * シーンを追加する
   * @param {string} name - シーンの名前
   * @param {function} updateFunction - シーン中の処理
   */
  add(name: string, updateFunction: () => {}) {
    this.scene[name] = updateFunction;
  }

  /**
   * アクティブなシーンを設定する
   * @param {string} name - アクティブにするシーンの名前
   */
  use(name: string) {
    // 指定されたシーンが存在するか確認する
    if (this.scene.hasOwnProperty(name) !== true) {
      // 存在しなかった場合はなにもせず終了する
      return;
    }
    // 名前をもとにアクティブなシーンを設定する
    this.activeScene = this.scene[name];
    // シーンをアクティブにした瞬間のタイムスタンプを設定する
    this.startTime = Date.now();
    // シーンをアクティブにしたのでカウンタをリセットする
    this.frame = -1;
  }

  /**
   * シーンを更新する
   */
  update() {
    // シーンがアクティブになってからの経過時間（秒）
    let activeTime = (Date.now() - this.startTime) / 1000;
    // 経過時間を引数に与えて updateFunction を呼び出す
    this.activeScene(activeTime);
    // シーンを更新したのでカウンタをインクリメントする
    ++this.frame;
  }
}
