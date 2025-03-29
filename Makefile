#!/bin/bash

migrade:
	npm run build && cp -rf dist/ ../iptv-checker-rs/web/