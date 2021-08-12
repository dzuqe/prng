all: js

teal:
	python contract.py

js:
	rollup -c rollup.config.js

test: 
	cd ui; python -m http.server 8000; cd -
