#!/usr/bin/env python3

# CWEtree v0.3
# https://github.com/mh0x/cwetree


import argparse
import inspect
import io
import json
import os
import requests
import sys
import xml.etree.ElementTree
import zipfile


__version__ = '0.3'
__author__ = 'https://github.com/mh0x'

script_name = 'CWEtree v' + __version__ + ' (' + __author__ + '/cwetree)'

cwe_xml_url = 'http://cwe.mitre.org/cwe-6'
cwe_views_url = 'https://cwe.mitre.org/data/xml/views/'
cwe_views = {'699': 'Development Concepts',
             '1000': 'Research Concepts',
             '1008': 'Architectural Concepts'}

script_path = os.path.realpath(inspect.getsourcefile(lambda: 0))
default_dir_rel = os.path.join('html', 'js')
default_dir = os.path.join(os.path.dirname(script_path), default_dir_rel)


def error(err):
    print('[!] error: ' + str(err), file=sys.stderr)
    sys.exit(1)


def info(msg, quiet=False):
    if not quiet:
        print('[*] ' + msg)


def prologue(quiet=False):
    if not quiet:
        print(script_name)


class ArgParser(argparse.ArgumentParser):
    def format_help(self):
        formatter = self._get_formatter()
        formatter.add_text(script_name)
        formatter.add_usage(self.usage, self._actions,
                            self._mutually_exclusive_groups)
        for action_group in self._action_groups:
            formatter.start_section(action_group.title)
            formatter.add_text(action_group.description)
            formatter.add_arguments(action_group._group_actions)
            formatter.end_section()
        formatter.add_text(self.epilog)
        return formatter.format_help()

    def error(self, msg):
        raise argparse.ArgumentTypeError(msg + os.linesep*2
                                         + self.format_usage().rstrip())


def parse_args():
    parser = ArgParser()
    parser.add_argument('-q', '--quiet', action='store_true',
                        help='suppress messages sent to stdout')
    parser.add_argument('-d', '--dir', default=default_dir,
                        help='output directory path (default: '
                             + default_dir_rel + ')')
    try:
        return parser.parse_args()
    except argparse.ArgumentTypeError as err:
        prologue()
        print()
        error(err)


def download_xml(view_id, quiet=False):
    xfile = view_id + '.xml'
    zfile = xfile + '.zip'
    info('downloading ' + zfile, quiet)
    try:
        resp = requests.get(cwe_views_url + zfile)
        info('unzipping ' + zfile, quiet)
        with zipfile.ZipFile(io.BytesIO(resp.content), 'r') as zip:
            with zip.open(xfile, 'r') as fp:
                info('parsing ' + xfile, quiet)
                return xml.etree.ElementTree.parse(fp).getroot()
    except (IOError, zipfile.BadZipFile) as err:
        error(err)


def generate_node(id, name, children=[]):
    if children:
        return {'cid': id, 'name': name, 'children': children}
    return {'cid': id, 'name': name}


def generate_children(id, items):
    children = []
    for id1 in items:
        if id in items[id1]['parents']:
            children.append(generate_node(id1, items[id1]['name'],
                            generate_children(id1, items)))
    return children


def generate_tree(view_id, view_name, items):
    tree = generate_node(view_id, view_name)
    tree['children'] = []
    for id in [id for id in items if not items[id]['parents']]:
        tree['children'].append(generate_node(id, items[id]['name'],
                                generate_children(id, items)))
    return tree


def generate_json(view_id, view_name, view_xml, dir=default_dir, quiet=False):
    jfile = view_id + '.js'
    info('generating ' + jfile, quiet)
    items = {}
    for item in view_xml.findall('.//{' + cwe_xml_url + '}Weakness'):
        id = item.get('ID')
        related = item.find('{' + cwe_xml_url + '}Related_Weaknesses')
        items[id] = {'id': id, 'name': item.get('Name'), 'parents': {
            item.get('CWE_ID') for item in related
            if item.get('Nature') == 'ChildOf'} if related else set()}
    try:
        with open(os.path.join(dir, jfile), 'w') as fp:
            fp.write('var view_' + view_id + ' = ')
            json.dump(generate_tree(view_id, view_name, items), fp)
    except IOError as err:
        error(err)


def main():
    args = parse_args()
    prologue(args.quiet)
    try:
        for view_id, view_name in cwe_views.items():
            view_xml = download_xml(view_id, args.quiet)
            generate_json(view_id, view_name, view_xml, args.dir, args.quiet)
    except KeyboardInterrupt:
        print('  stopping ...')
    else:
        info('done', args.quiet)


if __name__ == '__main__':
    main()
