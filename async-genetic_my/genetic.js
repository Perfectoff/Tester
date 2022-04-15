import { clone, Minimize, Maximize } from './utils.js';
export const Select = { Tournament2, Tournament3, Fittest, Random, RandomLinearRank, Sequential };
export class Genetic {
    constructor(options, entities = []) {
        this.entities = entities;
        this.internalGenState = {}; /* Used for random linear */
        this.population = [];
        this.tryCrossover = () => {
            const { crossoverProbability, crossoverFunction } = this.options;
            let selected = crossoverFunction != undefined && Math.random() <= crossoverProbability ? this.selectPair() : this.selectOne();
            if (selected.length === 2) {
                selected = crossoverFunction(selected[0], selected[1]);
            }
            return selected.map(this.tryMutate);
        };
        this.tryMutate = (entity) => {
            // applies mutation based on mutation probability
            if (this.options.mutationFunction && Math.random() <= this.options.mutateProbability) {
                return this.options.mutationFunction(entity);
            }
            return entity;
        };
        let partialCheck; // для проверки
        let defaultOptions = partialCheck = {
            populationSize: 250,
            mutateProbability: 0.2,
            crossoverProbability: 0.9,
            fittestNSurvives: 1,
            select1: Select.Tournament2,
            select2: Select.Tournament2,
            optimize: Optimize.Maximize,
            threads: Number.MAX_VALUE, //navigator?.hardwareConcurrency ?? 4
        };
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
    }
    get currentPopulation() { return this.population; }
    //console.assert(population.length==this.population.length);
    set currentPopulation(population) { this.population = [...population]; }
    seed(entities = []) {
        this.entities = entities;
        // seed the population
        for (let i = 0; i < this.options.populationSize; ++i) {
            this.entities.push(this.options.randomFunction());
        }
    }
    best(count = 1) {
        return this.population.slice(0, count).map((ph) => ph.entity);
    }
    breed() {
        // crossover and mutate
        const newPop = [];
        // lets the best solution fall through
        if (this.options.fittestNSurvives) {
            newPop.push(...this.population.slice(0, this.options.fittestNSurvives).map((ph) => ph.entity));
        }
        // Length may be change dynamically, because fittest and some pairs from crossover
        while (newPop.length < this.options.populationSize) {
            newPop.push(...this.tryCrossover());
        }
        this.entities = newPop;
    }
    async estimate() {
        const { fitnessFunction, optimize } = this.options;
        // reset for each generation
        this.internalGenState = {};
        // cleanup score and sort
        this.population.length = 0;
        const tasks = this.entities.map((entity) => fitnessFunction(entity));
        this.population = await (await Promise.all(tasks))
            //this.population = await (await runPromisesByThreads(tasks, this.options.threads))
            .map((fitness, i) => ({ fitness, entity: this.entities[i] }))
            .sort((a, b) => (optimize(a.fitness, b.fitness) ? -1 : 1));
        const popLen = this.population.length;
        const mean = this.getMean();
        this.stats = {
            maximum: this.population[0].fitness,
            minimum: this.population[popLen - 1].fitness,
            mean,
            stdev: this.getStdev(mean),
        };
    }
    /**
     * Mean deviation
     */
    getMean() {
        return this.population.reduce((a, b) => a + b.fitness, 0) / this.population.length;
    }
    /**
     * Standart deviation
     */
    getStdev(mean) {
        const { population: pop } = this;
        const l = pop.length;
        return Math.sqrt(pop.map(({ fitness }) => (fitness - mean) * (fitness - mean)).reduce((a, b) => a + b, 0) / l);
    }
    selectOne() {
        const { select1 } = this.options;
        return [clone(select1.call(this, this.population))];
    }
    selectPair() {
        const { select2 } = this.options;
        return [clone(select2.call(this, this.population)), clone(select2.call(this, this.population))];
    }
}
/** Utility */
function Tournament2(pop) {
    const n = pop.length;
    const a = pop[Math.floor(Math.random() * n)];
    const b = pop[Math.floor(Math.random() * n)];
    return this.options.optimize(a.fitness, b.fitness) ? a.entity : b.entity;
}
function Tournament3(pop) {
    const n = pop.length;
    const a = pop[Math.floor(Math.random() * n)];
    const b = pop[Math.floor(Math.random() * n)];
    const c = pop[Math.floor(Math.random() * n)];
    let best = this.options.optimize(a.fitness, b.fitness) ? a : b;
    best = this.options.optimize(best.fitness, c.fitness) ? best : c;
    return best.entity;
}
function Fittest(pop) {
    return pop[0].entity;
}
function Random(pop) {
    return pop[Math.floor(Math.random() * pop.length)].entity;
}
function RandomLinearRank(pop) {
    this.internalGenState['rlr'] = this.internalGenState['rlr'] || 0;
    return pop[Math.floor(Math.random() * Math.min(pop.length, this.internalGenState['rlr']++))].entity;
}
function Sequential(pop) {
    this.internalGenState['seq'] = this.internalGenState['seq'] || 0;
    return pop[this.internalGenState['seq']++ % pop.length].entity;
}
const Optimize = { Minimize, Maximize };
async function runPromisesByThreads(tasks, threadCount) {
    let group = tasks.slice(0, threadCount).map((task, i) => Promise.all([i, task, i]));
    let results = [];
    for (let n = group.length; n <= tasks.length; n++) {
        let [i, result, iTask] = await Promise.race(group);
        results[iTask] = result;
        group[i] = Promise.all([i, tasks[n], n]);
    }
    return results;
}
