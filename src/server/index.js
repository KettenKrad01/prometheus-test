import Koa from 'koa'
import Router from 'koa-router'
import promClient from 'prom-client'

function main() {
  const PORT = process.env.PORT || 3333;
  const testCounter = new promClient.Counter({
    name: 'request_count',
    help: 'QPS',
    labelNames: ['url']
  })

  const testGauge = new promClient.Gauge({
    name: 'memory_gauge',
    help: 'Memory'
  })

  const testHistogram = new promClient.Histogram({
    name: 'test_histogram',
    help: 'test histogram',
    buckets: [20, 40, 60, 100]
  })

  const testSummary = new promClient.Summary({
    name: 'test_summary',
    help: 'test summary',
    buckets: [0.2, 0.4, 0.6, 0.99]
  })

  setInterval(() => {
    testCounter.labels({url: '/test'}).inc()
    testGauge.set(Math.random() * 100)
    testHistogram.observe(Math.random() * 100)
    testSummary.observe(Math.random() * 100)

  }, 2000)

  const app = new Koa()
  const router = new Router()

  const handler = (ctx) => {
    testCounter.labels({url: ctx.path}).inc()
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

