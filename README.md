# caching-proxy-server

A CLI tool that starts a caching proxy server, it will forward requests to the actual server and cache the responses. If the same request is made again, it will return the cached response instead of forwarding the request to the server.

## Usage

### Start

```
caching-proxy start --port <number> --origin <url>
```

`--port` is the port on which the caching proxy server will run.

`--origin` is the URL of the server to which the requests will be forwarded.

For example,

```
caching-proxy start --port 3000 --origin http://dummyjson.com
```

The caching proxy server starts on port 3000 and forward requests to http://dummyjson.com.

Taking the above example, if the user makes a request to http://localhost:3000/products, the caching proxy server forwards the request to http://dummyjson.com/products, return the response along with headers and cache the response. Also, headers are added to the response that indicate whether the response is from the cache or the server.

```
# If the response is from the cache
X-Cache: HIT

# If the response is from the origin server
X-Cache: MISS
```

If the same request is made again, the caching proxy server returns the cached response instead of forwarding the request to the server.

### Clear cache

To clear the cache, run the command:

```
caching-proxy clear
```