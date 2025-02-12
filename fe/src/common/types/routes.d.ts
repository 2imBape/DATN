export {};

declare global {
  /**
   * Now declare things that go in the global namespace,
   * or augment existing declarations in the global namespace.
   */
  interface RoutesType {
    name?: string;
    element?: ComponentType;
    path: string;
    children?: Array<RoutesType>;
  }
}
