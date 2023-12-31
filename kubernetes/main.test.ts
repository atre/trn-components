import { Testing } from 'cdk8s';
import { MyChart } from './main';

describe('Placeholder', () => {
  test('Empty', () => {
    const app = Testing.app();
    const chart = new MyChart(app, 'test-chart');
    const results = Testing.synth(chart);
    expect(results).toMatchSnapshot();
  });
});
