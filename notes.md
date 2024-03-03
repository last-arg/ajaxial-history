# Save many elements to history

Would have an attribute ajxl-history-name="<name>". Would only save 
elements with attribute ajxl-history-name. History state object would 
be '{ <name>: innerHtml }'. Empty ajxl-history-name would have name 'default'.
<name> could be an array that contains values for innerHtml. They would be
swapped back in order they were added. Or if element has id, use id? Or use
some other attribute or combinations of attributes? Like ajxl-path, 
ajxl-history-path?

## Questions
- What to do about recursive ajxl-history-name attributes?
- What happens if there several different elements with same axl-history-name?
- What to do about sensitive data? User wants to hide data?

Could just provide basic functionality. Allow users to provide read/write
function to storage of their choosing. I would use what the browser natively 
provides.

Run History.replaceState after every ajaxial:finish or ajaxial:load event?
This would also happen in popstate event, which isn't ideal. Have to think
about it. ajaxial:load event is only fired when process() is called, I do.
But ajaxial:finish is fired before ajaxial:load and ajaxial:finish event
is called in another function. Should be able to use ajaxial:finish.

# Modify response based on status code. This should be its own extension

Have Ajaxial.responseStrategies object that would contain functions that would 
modify status code's response. This modifications would happen in 
ajaxial:requestSuccess and ajaxial:request Failure events. Events parameters: 
{source, response, params}

To change what response body returns, can overwrite Response.text() function.
And just in case run Response.body.cancel() to turn Response.bodyUsed to true.
Remember that calling Event.preventDefault() will return empty body.

I can't do any async events inside event callbacks. That means I can' access
response body inside callback. I could only construct return new body based
on status code. Solution would be to write my own Ajaxial method that can
go crazy with all the changes. Or overwrite existing Ajaxial methods.

Maybe have responseStragtegies values that apply to whole number ranges. Like
"2", "2XX", "21", "21X", "2X4". Seems like options with "X" seems better, or
some other symbol. Maybe this would have to be its own extension?

## Be aware
- Response.body.ReadableStream.locked gets locked when there is an active reader,
ReadableStream.getReader() was called somewhere
- Nothing else in ajaxial code has access to Response object
- This would not work for ajaxial:requestError event because there is no response.

## Example
```
Ajaxial.responseStrategies["204"] = function(input) {
  ... 
}
```
