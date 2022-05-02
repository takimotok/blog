---
title: "matplotlib 使おうとしたら No module named '_tkinter' エラーで怒られた"
tags: ['python']
created_at: '2018-05-27'
---

matplotlib 使おうとしたら No module named '\_tkinter' エラーで怒られた.  
tkinter モジュールがない, とのことらしい.

解決までの過程をメモ.

## 動作環境

- CentOS 7
- Python 3.6.5

vagrant上にcentosを入れて, ホストマシンであるwindows10から操作する.

## 背景

次のコマンドを実行したら tkinter がないよ, と怒られた.

```py
>>> import math
>>> import numpy as np
>>> from matplotlib import pyplot
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/matplotlib/pyplot.py", line 115, in <module>
    _backend_mod, new_figure_manager, draw_if_interactive, _show = pylab_setup()
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/matplotlib/backends/__init__.py", line 62, in pylab_setup
    [backend_name], 0)
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/matplotlib/backends/backend_tkagg.py", line 4, in <module>
    from . import tkagg  # Paint image to Tk photo blitter extension.
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/matplotlib/backends/tkagg.py", line 5, in <module>
    from six.moves import tkinter as Tk
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/six.py", line 92, in __get__
    result = self._resolve()
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/six.py", line 115, in _resolve
    return _import_module(self.mod)
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/six.py", line 82, in _import_module
    __import__(name)
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/tkinter/__init__.py", line 36, in <module>
    import _tkinter # If this fails your Python may not be configured for Tk
ModuleNotFoundError: No module named '_tkinter'
```

どうやら `from matplotlib import pyplot` でコケたらしい.  
matplotlibが tkinter に依存してるっぽい.

原因調査をしてみる.

## tkinter ってなに

まず tkinter について.

> Tkinter は Python からGUIを構築・操作するための標準ライブラリ（ウィジェット・ツールキット）である。  
>
> (中略)
>
> これにより、スクリプト言語である Python から簡単にGUI画面をもったアプリケーションを作ることが可能になる。
>
> -- [Tkinter | wikipedia](https://ja.wikipedia.org/wiki/Tkinter)

pythonのplotとかをよしなに描画してくれるツールっぽい.

公式サイトも見てみる.

> The tkinter package (“Tk interface”) is the standard Python interface to the Tk GUI toolkit.  
> Both Tk and tkinter are available on most Unix platforms, as well as on Windows systems. (Tk itself is not part of Python; it is maintained at ActiveState.)  
> You can check that tkinter is properly installed on your system by running  
> `python -m tkinter`  
> from the command line; this should open a window demonstrating a simple Tk interface.
>
> -- [tkinter — Python interface to Tcl/Tk](https://docs.python.org/3.3/library/tkinter.html)

GUIの描画ツールだよー, と書かれている.  
次のコマンドで tkinter がinstallされているかチェックできるらしいので, 実行してみる.

```sh
$ python -m tkinter

Traceback (most recent call last):
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/runpy.py", line 183, in _run_module_as_main
    mod_name, mod_spec, code = _get_module_details(mod_name, _Error)
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/runpy.py", line 142, in _get_module_details
    return _get_module_details(pkg_main_name, error)
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/runpy.py", line 109, in _get_module_details
    __import__(pkg_name)
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/tkinter/__init__.py", line 36, in <module>
    import _tkinter # If this fails your Python may not be configured for Tk
ModuleNotFoundError: No module named '_tkinter'
```

予想通り, 自分の環境に tkinter はないね.

## tkinter インストール

ググったり, pip でパッケージ探したりしたけど...  
どうやら yum コマンドで入手するのがベターっぽい.

この辺りについては次のサイト主さんが丁寧にまとめてくれていた.  
ありがとうございます.

> 今回の環境では"tk-devel"というパッケージがインストールするそれにあたりました。  
> "tkinter"というパッケージだと動きません。罠です。
>
> -- [CentOS7.2のpyenv上python3.5.2環境でtkinterを利用する方法 |goodbyegangsterのブログ](http://goodbyegangster.hatenablog.com/entry/2016/12/17/054050)

パッケージ確認 & インストール を行う.

```sh
# 利用可能な tkinter パッケージの確認
$ sudo yum -y list available | grep -i tk-devel

at-spi2-atk-devel.i686                  2.22.0-2.el7                   base
at-spi2-atk-devel.x86_64                2.22.0-2.el7                   base
atk-devel.i686                          2.22.0-3.el7                   base
atk-devel.x86_64                        2.22.0-3.el7                   base
clutter-gtk-devel.i686                  1.8.4-1.el7                    base
clutter-gtk-devel.x86_64                1.8.4-1.el7                    base
colord-gtk-devel.i686                   0.1.25-4.el7                   base
colord-gtk-devel.x86_64                 0.1.25-4.el7                   base
fltk-devel.i686                         1.3.4-1.el7                    base
fltk-devel.x86_64                       1.3.4-1.el7                    base
ghc-gtk-devel.x86_64                    0.12.5.0-1.2.el7               epel
itk-devel.x86_64                        3.4-9.el7                      epel
libfm-gtk-devel.x86_64                  1.2.4-3.el7                    epel
libfm-gtk-devel-common.noarch           1.2.4-3.el7                    epel
libinfinity-gtk-devel.x86_64            0.6.6-1.el7                    epel
libnm-gtk-devel.i686                    1.8.6-2.el7                    base
libnm-gtk-devel.x86_64                  1.8.6-2.el7                    base
libreport-gtk-devel.i686                2.1.11-40.el7.centos           base
libreport-gtk-devel.x86_64              2.1.11-40.el7.centos           base
libunicapgtk-devel.x86_64               0.9.8-9.el7                    epel
libyui-gtk-devel.x86_64                 2.44.5-5.el7                   epel
mathgl-fltk-devel.x86_64                2.3.3-7.el7                    epel
ocaml-lablgtk-devel.x86_64              2.18.3-9.el7                   epel
perl-Tk-devel.x86_64                    804.030-6.el7                  base
plplot-tk-devel.x86_64                  5.10.0-10.el7                  epel
plplot-wxGTK-devel.x86_64               5.10.0-10.el7                  epel
tk-devel.i686                           1:8.5.13-6.el7                 base
tk-devel.x86_64                         1:8.5.13-6.el7                 base # <- たぶんこれ
vtk-devel.x86_64                        6.1.0-5.el7                    epel
webkitgtk-devel.x86_64                  2.4.9-1.el7                    epel
wxGTK-devel.x86_64                      2.8.12-20.el7                  epel
zbar-gtk-devel.x86_64                   0.10-27.el7                    epel


# install
$ sudo yum -y install tk-devel.x86_64
```

installしただけでは tkinter は使えない.  
先程紹介したサイト主さんが仰るように, pythonの uninstall / install を行う必要がある.

私は anyenv 経由で pyenvを入れて python を入れたので,  
なにか起きたらこの辺を疑ってみる.

```sh
# pyenv のバージョン確認
$ anyenv versions

pyenv:
  system
* 3.6.5 (set by /home/vagrant/.anyenv/envs/pyenv/version)


# pyenv経由でinstallしたpythonのバージョン確認
$ python --version

Python 3.6.5


#
# uninstall / install python
#
$ pyenv uninstall 3.6.5
pyenv: remove /home/vagrant/.anyenv/envs/pyenv/versions/3.6.5? yes

$ python --version
-bash: /home/vagrant/.anyenv/envs/pyenv/shims/python: No such file or directory # ちゃんとuninstallされた

$ pyenv install 3.6.5

# 有効化
$ pyenv rehash

# 確認
$ anyenv versions
pyenv:
  system
* 3.6.5 (set by /home/vagrant/.anyenv/envs/pyenv/version)

# 切替
$ pyenv global 3.6.5
$ pyenv rehash

# 再確認
$ python --version
Python 3.6.5
```

ちゃんと動くか確認.

```py
>>> import tkinter
>>> tkinter.Tk()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/tkinter/__init__.py", line 2020, in __init__
    self.tk = _tkinter.create(screenName, baseName, className, interactive, wantobjects, useTk, sync, use)
_tkinter.TclError: no display name and no $DISPLAY environment variable
```

コケた.  
手強いな...

ざっとエラーログを見ると環境変数が与えられてないっぽい.

いろいろ調べてみると, どうやら matplotlib はssh経由で起動しようとしたらこのエラーときに遭遇しやすいらしい.

ドキュメントの該当箇所はここ↓

> Matplotlib in a web application server  
> Many users report initial problems trying to use maptlotlib in web application servers,  
> because by default Matplotlib ships configured to work with a graphical user interface which may require an X11 connection.  
> **Since many barebones application servers do not have X11 enabled, you may get errors if you don’t configure Matplotlib for use in these environments.**  
> Most importantly, you need to decide what kinds of images you want to generate (PNG, PDF, SVG) and configure the appropriate default backend.  
> For 99% of users, this will be the Agg backend, which uses the C++ antigrain rendering engine to make nice PNGs.  
> The Agg backend is also configured to recognize requests to generate other output formats (PDF, PS, EPS, SVG).  
> The easiest way to configure Matplotlib to use Agg is to call:
>
> -- [Matplotlib in a web application server | matplotlib.org](https://matplotlib.org/faq/howto_faq.html#matplotlib-in-a-web-application-server)

今回私がコケたのは↑これの太字箇所.

この辺は好みの問題だと思うけど, 私はサーバ上でもpythonを走らせるかもしれないのでデフォルト設定自体を変える.

ドキュメントによると `Agg` を設定すればいいらしい.  
`Agg backend` については引用元を参照.

毎回 import 時に設定するのは面倒なので, 設定ファイル自体を書き換える.

anyenvを使っている関係で設定ファイルの場所がわかりにくい.  
たぶん大元の設定ファイルはこれ↓

- /home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/matplotlib/mpl-data/matplotlibrc

ファイル設定を変更.

```
# /home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/matplotlib/mpl-data/matplotlibrc

backend : Agg
```

設定完了.

動作確認として図をpngとして出力してみる.

```py
# app.py

import math
import numpy as np
from matplotlib import pyplot

pi = math.pi   #mathモジュールのπを利用

x = np.linspace(0, 2*pi)
y = np.sin(x)

pyplot.plot(x, y)
pyplot.savefig( 'sinWave.png' ) # 画像出力
```

実行

`$ python app.py`

出力された `sinWave.png` を確認

![](/images/pages/posts/20180527/sinWave.png)

ok.

今回は以上.
