prjdir := ..
builddir := $(prjdir)/build
platform=$(shell uname -s)

all:node_modules

install: node_modules $(builddir)/dist/bundle.js

ifeq ($(platform),Linux)
# part for ubuntu 16.04 (probably valid for all debian distro)
node_modules: package.json
	sudo -u am_user -H npm install
$(builddir)/dist/bundle.js:$(shell find src -name "*.js" -print)
	sudo -u am_user -H node ./node_modules/.bin/webpack --mode production
clean:
	sudo -u am_user rm -rf $(builddir)/dist/
distclean:clean
	sudo -u am_user rm -rf node_modules
# end of ubuntu part
else
# part for macOSX
$(builddir)/dist/bundle.js:$(shell find src -name "*.js" -print)
	node ./node_modules/.bin/webpack --mode production
node_modules: package.json
	npm install
clean:
	rm -rf $(builddir)/dist/
distclean:clean
	rm -rf node_modules
#end of macOSX part
endif

