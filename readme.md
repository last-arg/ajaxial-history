# ajaxial-history

Extension for [ajaxial](https://ajaxial.unmodernweb.com/). This extension
adds handling of browser history. 

## Attributes
- ajxl-history="<path>"
This is required to make element change browser history. If "<path>" is empty 
will ajxl-path value.
- ajxl-history-action: 
  - push (default)
  - replace
- ajxl-history-name="<name>"
This allows to store/save different parts of the page based on <name> provided.
If <name> is empty "default" name will be used. If no ajxl-history-name is
found body element's innerHTML will be stored.

## Use custom storage
Can use your own custom storage solution by overwriting functions AjaxialHistory.storeState 
and/or AjaxialHistory.readState.
### AjaxialHistory.storeState()
#### Parameters
data - an object with key being ajxl-history-name and value being element's 
inner html.

Example:
```html
<div ... ajxl-history-name="main">Main content</div>
```
```js
{ "main": "Main content" }
```

#### Return value
Output will be used by History.pushState or History.repeatState functions.
Output can be anything. This output value will returned to you when using 
AjaxialHistory.readState function.

### AjaxialHistory.readState()
#### Parameters
data - value will be whatever 'storeState' returned.

#### Return value
Will be in the shape of 
```js
{ "<ajxl-history-name>": "element's inner html" }
```

## To be wary of
- Currently if there are several elements with same <name> last element's
html will be stored. Could store all elements' html and restore it in the
same order? Or if element has id use it? Or some other attribute value?
- Don't do anything about if ajxl-history-name contains another ajxl-history-name.
This should not cause any problems. Although disallowing this would mean less 
extra work would be done.
- Should consider way to indicate not to include sensitive data.
