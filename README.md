# CWEtree

A visualisation of the [Common Weakness Enumeration](https://cwe.mitre.org/
"Common Weakness Enumeration (CWE)") (CWE) based on
[d3.layout.tree](https://mbostock.github.io/d3/talk/20111018/tree.html
"d3.layout.tree on GitHub"), where nodes are weaknesses and edges indicate
specialisation. Supports the views:
[Development Concepts](https://cwe.mitre.org/data/definitions/699.html
"CWE Development Concepts"),
[Research Concepts](https://cwe.mitre.org/data/definitions/1000.html
"CWE Research Concepts"),
[Architectural Concepts](https://cwe.mitre.org/data/definitions/1008.html
"CWE Architectural Concepts").

![CWEtree Screenshot](https://github.com/mh0x/cwetree/blob/master/html/img/cwetree.png
"CWEtree Screenshot")


## Install

```
git clone https://github.com/mh0x/cwetree.git
```


## Launch

Open `html/index.html` in a HTML5-compliant web browser.


## Update

Run `cwetree.py` to update the visualisation (e.g. post
[CWE v3.1](https://cwe.mitre.org/data/index.html "CWE List v3.1")).
Requires Python 3.

```
usage: cwetree.py [-h] [-q] [-d DIR]

optional arguments:
  -h, --help         show this help message and exit
  -q, --quiet        suppress messages sent to stdout
  -d DIR, --dir DIR  output directory path (default: html/js)
```


## License

[MIT](https://github.com/mh0x/cwetree/blob/master/LICENSE "MIT License")
© 2018 mh0x
