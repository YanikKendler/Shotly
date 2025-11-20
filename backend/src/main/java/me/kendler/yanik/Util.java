package me.kendler.yanik;

public class Util {
    public static void timer(long start, String name){
        long durationNs = System.nanoTime() - start;
        double seconds = durationNs / 1_000_000_000.0;
        double milliseconds = durationNs / 1_000_000.0;
        System.out.printf(name + " took: %.3f s (%.3f ms)%n", seconds, milliseconds);
    }
}
