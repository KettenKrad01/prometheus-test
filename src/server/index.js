import Koa from 'koa'
import Router from 'koa-router'
import promClient from 'prom-client'

function main() {
  const PORT = process.env.PORT || 3333;
  const requestMetrics = new promClient.Counter({
    name: 'request_count',
    help: 'QPS',
    labelNames: ['url']
  })

  const app = new Koa()
  const router = new Router()

  const handler = (ctx) => {
    requestMetrics.labels({url: ctx.path}).inc()
    ctx.status = 200
    ctx.body = `Response from '${ctx.path}' endpoint`
  }

  router.get(['/one', '/two', '/three'], handler);
  router.get('/metrics', async (ctx) => {
    const metricsData = await promClient.register.metrics()
    ctx.status = 200
    ctx.body = metricsData
  })
  app.use(router.routes());

  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

main()

