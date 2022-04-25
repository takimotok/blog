---
title: "matplotlib 使おうとしたら No module named '_bz2' エラーで怒られた"
tags: ['python']
created_at: '2018-05-26'
---

matplotlib 使おうとしたら No module named '\_bz2' エラーで怒られた.  
環境構築でハマることが多いな...

概要は次の通り.

## 動作環境

- CentOS 7
- Python 3.6.5
- matplotlib 2.2.2

## 背景

pipでmatplotlibのインストールは完了.  
実際コードを動かそうとしたらコンソールに次のようなエラーが出た.

```py
$ python app.py

Traceback (most recent call last):
  File "app.py", line 3, in <module>
    from matplotlib import pyplot
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/matplotlib/__init__.py", line 127, in <module>
    from . import cbook
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/matplotlib/cbook/__init__.py", line 13, in <module>
    import bz2
  File "/home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/bz2.py", line 23, in <module>
    from _bz2 import BZ2Compressor, BZ2Decompressor
ModuleNotFoundError: No module named '_bz2'
```

`_bz2` ってモジュールがないよ, と怒られてる.

ちなみに `app.py` ファイル冒頭では次のようにいくつかのモジュールを呼び出している.

```py
# app.py

import math
import numpy as np
from matplotlib import pyplot # <- ここでエラー
```

今回のエラーは matplotlib を呼び出したときに発生したもの.

## 解決手順

ググったらbug reportを発見.

> This is a problem as \_bz2 is not always installed, and not listed as a required dependency of matplotlib.  
> I am able to fix the issue easily by moving the import of bz2 back down  
> inside of the to\_filehandle() function, or alternatively placing it inside a try/except block.
>
> -- [https://github.com/matplotlib/matplotlib/issues/10866](https://github.com/matplotlib/matplotlib/issues/10866)

どうやら bz2 に依存してるっぽい.  
この報告者の言う方法ではなく, それに答えてくれてる方の修正commitをgithubで確認.  
それ通りに修正.

念の為対象ファイルのオリジナルをコピーしておく.

```sh
$ cd /home/vagrant/.anyenv/envs/pyenv/versions/3.6.5/lib/python3.6/site-packages/matplotlib/cbook/

# backup
$ cp __init__.py __init__.py.org

# 確認
$ ls -lah | grep -i init
-rw-rw-r-- 1 vagrant vagrant  86K May 25 00:21 __init__.py
-rw-rw-r-- 1 vagrant vagrant  86K May 26 15:46 __init__.py.org
```

ok.  
じゃあ変更するか.

```py
# /matplotlib/cbook/__init__.py

# 中略

 def to_filehandle(fname, flag='rU', return_opened=False, encoding=None):
     """
     *fname* can be an `os.PathLike` or a file handle.  Support for gzipped
     files is automatic, if the filename ends in .gz.  *flag* is a
     read/write flag for :func:`file`
     """
     if hasattr(os, "PathLike") and isinstance(fname, os.PathLike):
         return to_filehandle(
             os.fspath(fname),
             flag=flag, return_opened=return_opened, encoding=encoding)
     if isinstance(fname, six.string_types):
         if fname.endswith('.gz'):
             # get rid of 'U' in flag for gzipped files.
             flag = flag.replace('U', '')
             fh = gzip.open(fname, flag)
         elif fname.endswith('.bz2'):
             import bz2 # file冒頭のimportをここで宣言するように改修

             # get rid of 'U' in flag for bz2 files
             flag = flag.replace('U', '')
             fh = bz2.BZ2File(fname, flag)
         else:
             fh = io.open(fname, flag, encoding=encoding)
         opened = True
     elif hasattr(fname, 'seek'):
         fh = fname
         opened = False
     else:
         raise ValueError('fname must be a PathLike or file handle')
     if return_opened:
         return fh, opened
     return fh


# 以下 略
```

↑このファイル内で `to_filehandle()` が呼ばれている.  
その中に, ファイル冒頭でimportされている bz2 を移動.

移動先は `elif fname.endswith('.bz2'):` 直下.

ここまでできたら動作確認.

```py
>>> import matplotlib
>>>
```

ちゃんと読めてる.  
これでmatplotlibが使えるね.

今回は以上.
