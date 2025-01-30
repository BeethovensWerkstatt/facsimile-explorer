/* tslint:disable */
/* eslint-disable */
/**
 *
 * * create array with n elements in  array [a,b]
 * 
 */
export function linspace(a: number, b: number, n: number): Float64Array;
/**
 *
 * * calculate binomial coefficient (n over k)
 * 
 */
export function binomial_coefficient(n: number, k: number): number;
/**
 *
 * * calculate bernstein coefficient of degree n, index i at position t ([0,1})
 * 
 */
export function bernstein_coefficient(n: number, i: number, t: number): number;
/**
 *
 * * calculate all bernstein coefficients of degree n at position t ([0,1])
 * * @returns array of lenth n+1
 * 
 */
export function bernstein_coefficients(n: number, t: number): Float64Array;
/**
 *
 * * calculate point on bezier curve defined by control points q at position t
 * 
 */
export function bezier_point(q: Float64Array, t: number): Float64Array;
/**
 *
 * * calculate normalized tangent vector for bezier at position t
 * 
 */
export function bezier_tangent(qf: Float64Array, t: number): Float64Array;
/**
 *
 * * calculate normalized vector for bezier at position t
 * 
 */
export function bezier_norm(q: Float64Array, t: number): Float64Array;
/**
 *
 * * calculate bezier control points from points on curve
 * 
 */
export function bezier_reverse(pf: Float64Array): Float64Array;
